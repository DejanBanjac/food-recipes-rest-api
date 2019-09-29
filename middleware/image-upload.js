const multer = require('multer');
const cloudinary = require('cloudinary');
//const cloudinary = require('cloudinary').v2;
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'food-recipes',
    allowedFormats: ['jpg', 'png']
});
const parser = multer({ storage: storage });

module.exports = parser;