const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

if(process.env.NODE_ENV === 'development') {
    const dotenv = require('dotenv');
    dotenv.config();
}

const app = express();

app.use(bodyParser.json());

console.log(process.env.NODE_ENV);

mongoose
  .connect(process.env.MONGODB_CONNECTION_STRING)
  .then(result => {
    app.listen(process.env.PORT || 3000);
  })
  .catch(err => {
    console.log(err);
  });