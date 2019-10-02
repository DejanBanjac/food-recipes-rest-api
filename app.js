if(process.env.NODE_ENV === 'development') {
    const dotenv = require('dotenv');
    dotenv.config();
}

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const multer = require('multer');

const userRoutes = require('./routes/user');
const categoryRoutes = require('./routes/category');
const recipeRoutes = require('./routes/recipe');

const app = express();

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use('/user', multer().none(), userRoutes);
app.use('/category', categoryRoutes);
app.use('/recipe', recipeRoutes);

app.use((req, res, next)=>{
    const error = new Error('Resource not found...');
    error.statusCode = 404;
    next(error);
});

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