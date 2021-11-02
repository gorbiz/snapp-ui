const express = require('express')
const fs = require('fs')

const imgPath = process.env.IMG_PATH || '../snaps'
const baseUrl = process.env.BASE_URL || '/'
const title = process.env.TITLE || 'snaps-ui'
const port = process.env.PORT || 3000

const app = express()

function sectionFiles ({ files, threshold, file2date }) {
  const defaultFile2date = (name) => new Date(name.replace(/_(..)(..).jpg/, " $1:$2")) // NOTE consider to make overridable with env var / config file or something
  threshold = threshold || 1000 * 60 * 60 * 2 // 60s * 60 = 1h
  file2date = file2date || defaultFile2date

  const sections = []
  let sectionIndex = 0

  let prevDate = null
  for (let i = 0; i < files.length; i++) {
    date = file2date(files[i])
    if (prevDate && (date - prevDate) > threshold) sectionIndex++
    prevDate = date
    sections[sectionIndex] = sections[sectionIndex] || []
    sections[sectionIndex].push(files[i])
  }
  return sections
}

const files = fs.readdirSync(imgPath).filter((filename) => /.+\.(png|jpe?g)$/i.test(filename)).sort()
const sections = sectionFiles({ files })

app.use((req, res, next) => {
  res.removeHeader('X-Powered-By')
  next()
})

app.get(baseUrl, (req, res) => {
  res.setHeader('content-type', 'text/html')
  var content = fs.readFileSync(`${__dirname}/index.html`)
  if (process.env.LIVERELOAD === '1') { // NOTE to get live reload working on any browser...
    content += `<script>document.write('<script src="http://' + (location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1"></' + 'script>')</script>`
  }
  res.send(content)
})
app.get(`${baseUrl}files`, (req, res) => {
  const files = fs.readdirSync(imgPath).filter((filename) => /.+\.(png|jpe?g)$/i.test(filename)).sort()
  const sections = sectionFiles({ files })
  res.send({ title, files: sections[sections.length - 1], sections })
})

app.use(`${baseUrl}script.js`, express.static('script.js'));
app.use(`${baseUrl}style.css`, express.static('style.css'));
app.use('/favicon.ico', express.static('time-lapse.svg'));

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
