/* eslint-disable no-console */
// @ts-ignore
// Imports
const express = require('express')
const next = require('next')
const http = require('http')
const fs = require('fs')
const https = require('https')
// require('dotenv').config();
const app = express()
// Vars
const dev = false
const PORT = 5000
const hostname = process.env.NEXT_PUBLIC_APP_HOSTNAME
const nextjs = next({ dev, hostname, port: PORT })
const local = false
const handle = nextjs.getRequestHandler()
// const morgan = require("morgan");

// Next
nextjs
  .prepare()
  .then(async () => {
    // app.use(morgan);

    app.all('*', async (req, res) => {
      return await handle(req, res)
    })

    if (local) {
      http.createServer(app).listen(PORT, err => {
        if (err) throw err
        console.debug(`Application is running on http://localhost:${PORT}`)
      })
    } else {
      const key = fs.readFileSync('/etc/letsencrypt/live/development.mind-roots.com/privkey.pem')
      const cert = fs.readFileSync('/etc/letsencrypt/live/development.mind-roots.com/fullchain.pem')
      const options = { key: key, cert: cert }
      https.createServer(options, app).listen(PORT, err => {
        if (err) throw err
        console.debug(`Server listening on https://development.mind-roots.com:${PORT}`)
      })
    }
  })
  .catch(err => {
    console.debug('Error:::::', err)
  })
