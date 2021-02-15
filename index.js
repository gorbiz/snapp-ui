const express = require('express')
const fs = require('fs')

const imgPath = process.env.IMG_PATH || '../snaps'
const baseUrl = process.env.BASE_URL || '/'
const title = process.env.TITLE || 'snaps-ui'
const port = process.env.PORT || 3000

const app = express()

app.use((req, res, next) => {
  res.removeHeader('X-Powered-By')
  next()
})

app.set('view engine', 'pug')

app.get(baseUrl, (req, res) => {
  const files = fs.readdirSync(imgPath).sort()
  res.render('index', { title, baseUrl, files })
})

app.use(`${baseUrl}`, express.static(imgPath))

app.get('*', (req, res) => {
  res.sendStatus(404)
})

app.listen(port, () => {
  console.log(`snAPP started... port: ${port}`)
})
