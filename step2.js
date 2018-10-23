const express    = require('express'),
      bodyParser = require('body-parser'),
      crypto     = require("crypto");

require('dotenv').config();

const app = express();

app.use(bodyParser.json({
    verify: (req, res, buf, encoding) => {
      const signature = req.get("x-adobe-signature");
      if (signature) {
        const hmac = crypto.createHmac('sha256', process.env.CLIENT_SECRET)
        hmac.update(buf);
        const digest = hmac.digest('base64');
  
        if (signature !== digest) {
          throw new Error('x-adobe-signature HMAC check failed')
        }
      }
    }
  }));

app.get('/webhook', (req, res) => {
  if (req.query["challenge"]){
    res.send(req.query['challenge']);
  } else {
    console.log("No challenge");
    res.status(400);
  }
});

app.post('/webhook', (req, res) => {
  console.log(req.body);
  res.writeHead(200, { 'Content-Type': 'application/text' });
  res.end("pong");
});

var listener = app.listen(process.env.PORT, () => {
  console.log('Your app is listening on port ' + listener.address().port);
});