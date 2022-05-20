const express = require('express')
const fs = require('fs')
const child_process = require('child_process')

const imgPath = process.env.IMG_PATH || '../snaps'
const title = process.env.TITLE || 'snaps-ui'
const port = process.env.PORT || 3000

function onlyFolders (path) {
  const list = fs.readdirSync(path).filter(name => name !== 'videos')
  for (const file of list) {
    console.log({ a: fs.lstatSync(`${path}/${file}`) })
    if (!fs.lstatSync(`${path}/${file}`).isDirectory()) return false
  }
  return list
}

function exec (cmd) {
  return new Promise((resolve, reject) => {
    child_process.exec(cmd, (error, stdout, stderr) => {
      if (error) return reject(error)
      resolve(stdout.trim())
    })
  })
}

async function getLastFile (path, ext = 'jpg') {
  const file = await exec(`(cd ${path} && ls -1 *.${ext}) | tail -n1`)
  const mtime = fs.statSync(`${path}/${file}`).mtime
  const age = (new Date() - mtime) / 1000 // seconds
  return { file, age }
}

async function makePreview (folder) {
  const { file, age } = await getLastFile(`${imgPath}/${folder}`)
  let cls = 'age-above-60m'
  if (age <= 60 * 60) cls = 'age-below-60m'
  if (age <= 10 * 60) cls = 'age-below-10m'
  const film = folder.replaceAll(':', '-').toLowerCase() + '.webm'
  return `<figure class="${cls}">
      <span class="filename">${file}</span>
      <a href="/?folder=${folder}"><img src="/${folder}/${file}" /></a>
      <figcaption><span>${folder}</span><a href="/?folder=${folder}">🖼️ photos</a> <a href='/videos/${film}'>📽️ video</a></figcaption>
    </figure></a>`
}

const app = express()

app.use((req, res, next) => {
  res.removeHeader('X-Powered-By')
  req.subfolder = req.query.folder || ''
  next()
})

app.set('view engine', 'pug')

app.get('/', async (req, res) => {
  res.setHeader('content-type', 'text/html')
  const folders = onlyFolders(imgPath)
  if (!req.subfolder && folders) {
    let html = ''
    for (const folder of folders) {
      html += await makePreview(folder) + '\n'
    }

    const content = fs.readFileSync(`${__dirname}/index.html`).toString().replace('{{ main }}', html)
    return res.send(content)
  }
  var content = fs.readFileSync(`${__dirname}/photo-page.html`)
  if (process.env.LIVERELOAD) { // NOTE to get live reload working on any browser...
    content += `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`
  }
  res.send(content)
})

app.get('/files', (req, res) => {
  let path = imgPath
  if (req.subfolder) path += `/${req.subfolder}`
  const files = fs.readdirSync(path).filter((filename) => /.+\.(png|jpe?g)$/i.test(filename)).sort()
  res.send({ title, files })
})

app.get('/videos', (req, res) => {
  // TODO ~
  const html = `<body><video controls>
    <source src="/videos/cam0.webm" type="video/webm">
    Your browser does not support the video element. Kindly update it to latest version.
  </video></body>`
  res.send(html)
})

app.use('/script.js', express.static('script.js'))
app.use('/favicon.ico', express.static('time-lapse.svg'))

app.use('', express.static(imgPath))
app.use('/style/', express.static('style'))

app.get('*', (req, res) => {
  res.sendStatus(404)
})

app.listen(port, () => {
  console.log(`snAPP started... port: ${port}`)
})

if (process.env.LIVERELOAD === '1') { // to get instant feedback when developing
  const livereload = require('livereload')
  const server = livereload.createServer()
  server.watch([__dirname])
}
