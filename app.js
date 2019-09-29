if(process.env.NODE_ENV === 'development') {
    const dotenv = require('dotenv');
    dotenv.config();
}

const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');

const app = express();

app.use(bodyParser.json());
app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader(
        'Access-Control-Allow-Methods',
        'OPTIONS, GET, POST, PUT, PATCH, DELETE'
    );
    res.setHeader(
        'Access-Control-Allow-Headers', 
        'Content-Type, Authorization'
    );
    next();
});

app.use('/user', userRoutes);
app.use('/category', categoryRoutes);

app.use((error, req, res, next) => {
    console.log(error);
    const status = error.statusCode || 500;
    const message = error.message;
    const data = error.data;
    res.status(status).json({ message: message, data: data });
});

mongoose
    .connect(process.env.MONGODB_CONNECTION_STRING)
    .then(result => {
        app.listen(process.env.PORT || 3000);
    })
    .catch(err => {
        console.log(err);
    });