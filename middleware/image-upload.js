const multer = require('multer');
const cloudinary = require('cloudinary');
const cloudinaryStorage = require('multer-storage-cloudinary');

cloudinary.config();
const storage = cloudinaryStorage({
    cloudinary: cloudinary,
    folder: 'food-recipes',
    allowedFormats: ['jpg', 'png']
});
const parser = multer({ storage: storage });

module.exports = parser;