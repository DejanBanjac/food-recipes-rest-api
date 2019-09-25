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
    image: String,
    video: String,
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
});

module.exports = mongoose.model('Recipe', recipeSchema);