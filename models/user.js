const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const userSchema = new Schema({
    email: {
        type: String,
        required: true
    },
    password: {
      type: String,
      required: true
    },
    firstName: {
        type: String,
        required: true
    },
    lastName: {
        type: String,
        required: true
    },
    recipes: [
        {
            recipeId: {
                type: Schema.Types.ObjectId,
                ref: 'Recipe',
                required: true
            }
        }
    ]
});

userSchema.methods.addRecipeToFavorites = function(recipeId) {
    if(this.recipes.length != 0){
        const recipeIndex = this.recipes.findIndex(
            recipe => recipe.recipeId.toString() === recipeId.toString()
        );
    
        if(recipeIndex >= 0){
            throw new Error('This recipe is already in favourites!');
        }
    }

    this.recipes.push({recipeId: recipeId});
    
    return this.save();
};

userSchema.methods.removeRecipeFromFavorites = function(recipeId) {
    this.recipes = this.recipes.filter(recipe => 
        recipe.recipeId.toString() !== recipeId.toString()
    );
    return this.save();
};

module.exports = mongoose.model('User', userSchema);