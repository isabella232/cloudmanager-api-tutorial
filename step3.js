const express = require('express')
const bodyParser = require('body-parser')
const crypto = require('crypto')

require('dotenv').config()

const app = express()

app.use(bodyParser.json({
  verify: (req, res, buf, encoding) => {
    const signature = req.header('x-adobe-signature')
    if (signature) {
      const hmac = crypto.createHmac('sha256', process.env.CLIENT_SECRET)
      hmac.update(buf)
      const digest = hmac.digest('base64')

      if (signature !== digest) {
        throw new Error('x-adobe-signature HMAC check failed')
      }
    } else if (!process.env.DEBUG && req.method === 'POST') {
      throw new Error('x-adobe-signature required')
    }
  }
}))

app.get('/webhook', (req, res) => {
  if (req.query['challenge']) {
    res.send(req.query['challenge'])
  } else {
    console.log('No challenge')
    res.status(400)
  }
})

app.post('/webhook', (req, res) => {
  res.writeHead(200, { 'Content-Type': 'application/text' })
  res.end('pong')

  const STARTED = 'https://ns.adobe.com/experience/cloudmanager/event/started'
  const EXECUTION = 'https://ns.adobe.com/experience/cloudmanager/pipeline-execution'

  const event = req.body.event

  if (STARTED === event['@type'] &&
       EXECUTION === event['xdmEventEnvelope:objectType']) {
    console.log('received execution start event')
  }
})

const listener = app.listen(process.env.PORT, () => {
  console.log(`Your app is listening on port ${listener.address().port}`)
})
