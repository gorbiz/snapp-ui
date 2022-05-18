const express = require('express')
const fs = require('fs')
const { exec } = require('child_process')

const imgPath = process.env.IMG_PATH || '../snaps'
const baseUrl = process.env.BASE_URL || '/'
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

function getLastFile (path) {
  return new Promise((resolve, reject) => {
    exec(`ls -1 ${path} | tail -n1`, (error, stdout, stderr) => {
      if (error) return reject(error)
      resolve(stdout.trim())
    })
  })
}

async function makePreview (folder) {
  const file = await getLastFile(`${imgPath}/${folder}`)
  console.log(`${folder}/${file} ....`)
  return `<a href="/?folder=${folder}"><figure>
      <img src="/${folder}/${file}" />
      <figcaption>${folder}</figcaption>
    </figure></a>`
}

const app = express()

app.use((req, res, next) => {
  res.removeHeader('X-Powered-By')
  req.subfolder = req.query.folder || ''
  next()
})

app.set('view engine', 'pug')

app.get(baseUrl, async (req, res) => {
  res.setHeader('content-type', 'text/html')
  const folders = onlyFolders(imgPath)
  if (!req.subfolder && folders) {
    let html = ''
    for (const folder of folders) {
      html += await makePreview(folder) + '\n'
    }
    html = `
      <style>
        img { height: 50vh; }
        section {
          display: flex;
          flex-wrap: wrap;
        }
      </style>
      <section>${html}</section>`
    return res.send(html)
  }
  var content = fs.readFileSync(`${__dirname}/index.html`)
  if (process.env.LIVERELOAD) { // NOTE to get live reload working on any browser...
    content += `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`
  }
  res.send(content)
})

app.get(`${baseUrl}files`, (req, res) => {
  let path = imgPath
  if (req.subfolder) path += `/${req.subfolder}`
  const files = fs.readdirSync(path).filter((filename) => /.+\.(png|jpe?g)$/i.test(filename)).sort()
  res.send({ title, files })
})

app.get(`${baseUrl}videos`, (req, res) => {
  // TODO ~
  const html = `<body style="margin: 0;"><video controls>
    <source src="/videos/cam0.webm" type="video/webm">
    Your browser does not support the video element. Kindly update it to latest version.
  </video></body>`
  res.send(html)
})

app.use(`${baseUrl}script.js`, express.static('script.js'))
app.use(`${baseUrl}style.css`, express.static('style.css'))
app.use('/favicon.ico', express.static('time-lapse.svg'))

app.use(`${baseUrl}`, express.static(imgPath))

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
