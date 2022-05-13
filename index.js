const express = require('express')
const fs = require('fs')

const imgPath = process.env.IMG_PATH || '../snaps'
const baseUrl = process.env.BASE_URL || '/'
const title = process.env.TITLE || 'snaps-ui'
const port = process.env.PORT || 3000

function onlyFolders (path) {
  const list = fs.readdirSync(path)
  for (const file of list) {
    console.log({ a: fs.lstatSync(`${path}/${file}`) })
    if (!fs.lstatSync(`${path}/${file}`).isDirectory()) return false
  }
  return list
}

const app = express()

app.use((req, res, next) => {
  res.removeHeader('X-Powered-By')
  req.subfolder = req.query.folder || ''
  next()
})

app.set('view engine', 'pug')

app.get(baseUrl, (req, res) => {
  res.setHeader('content-type', 'text/html')
  const folders = onlyFolders(imgPath)
  if (!req.subfolder && folders) {
    console.log({ folders, q: req.query })
    return res.send(folders.map((folder) => `<a href="/?folder=${folder}">${folder}</a>`).join('\n'))
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
