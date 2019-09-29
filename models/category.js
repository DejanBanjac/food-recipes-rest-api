const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const categorySchema = new Schema({
    name: {
        type: String,
        required: true
    },
    image: {
        url: String,
        public_id: String
    }
});

module.exports = mongoose.model('Category', categorySchema);