const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const recipeSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    ingredients: [
        {
            name: {
                type: String,
                required: true
            },
            measure: {
                type: String,
                required: true
            }
        }
    ],
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    image: {
        url: String,
        public_id: String
    },
    video: String
});

module.exports = mongoose.model('Recipe', recipeSchema);