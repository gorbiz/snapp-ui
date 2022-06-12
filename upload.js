const express = require('express')
const fs = require('fs')
const multer = require('multer')

const app = express()

const baseDir = process.env.BASE_DIR || '../photos'

// File upload ...from ESP32
const upload = multer({ dest: './tmp' })
app.post('/upload/:id', upload.single('imageFile'), (req, res) => {
  const { id } = req.params
  const dir = `${baseDir}/${id}`
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true })
  // const filename = new Date().toLocaleString('sv-EN').replace(' ', '_').replaceAll(':', '').split('.')[0] + '.jpg' // Was considering this...
  const filename = new Date().toISOString().replace('T', '_').replaceAll(':', '').replaceAll('Z', '') + '.jpg' // ex 2022-05-13_125229.jpg
  fs.rename(req.file.path, `${dir}/${filename}`, (err) => {
    if (err) {
      console.log(err)
      res.send(500)
    } else {
      res.json({
        message: 'File uploaded successfully',
        filename: req.file.filename
      })
    }
  })
})

const port = process.env.PORT || 8080
app.listen(port, () => {
  console.log(`Server is listening on porT ${port}`)
})
