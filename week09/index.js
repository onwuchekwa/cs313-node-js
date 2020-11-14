const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

const rates = require('./modules/rates');
const PUBLIC_DIR = path.join(__dirname, 'public')
const VIEWS_DIR = path.join(__dirname, 'views');

express()
  .use(express.static(PUBLIC_DIR))
  .set('views', VIEWS_DIR)
  .set('view engine', 'ejs')
  .get('/', (req, res) => { res.sendFile(`${PUBLIC_DIR}/index.html`); })
  .get('/getRate', (req, res) => { rates.getRate(req, res) })
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))
