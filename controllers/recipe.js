const { validationResult } = require('express-validator/check');
const cloudinary = require('cloudinary').v2;

const recipe = require('../models/recipe');

exports.addRecipe = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation has failed:' + errors.array().map(error => '\n' + error.msg));
        error.statusCode = 422;
        
        if(req.file){
            cloudinary.uploader.destroy(req.file.public_id).
                then( result => {
                    next(error);
                });
        }
        else{
            next(error);
        }
    }
    else{
        const name = req.body.name;
        const description = req.body.description;
        const ingredients = req.body.ingredients;
        const categoryId = req.body.category;    
        const image = {
            url: req.file.url,
            public_id: req.file.public_id
        };
        const video = req.body.video;
    
        const newRecipe = new recipe({
            name: name,
            description: description,
            ingredients: ingredients,
            category: categoryId,
            image: image,
            video: video
        });
    
        newRecipe
            .save()
            .then(result => {
                res.status(201).json({
                    message: 'Recipe created successfully!',
                    recipe: newRecipe
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });
    }
};

exports.editRecipe = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation has failed:' + errors.array().map(error => '\n' + error.msg));
        error.statusCode = 422;
        
        if(req.file){
            cloudinary.uploader.destroy(req.file.public_id).
                then( result => {
                    next(error);
                });
        }
        else{
            next(error);
        }
    }
    else{
        const recipeId = req.params.recipeId;

        const name = req.body.name;
        const description = req.body.description;
        const ingredients = req.body.ingredients;
        const categoryId = req.body.category;    
        const image = {
            url: req.file.url,
            public_id: req.file.public_id
        };
        const video = req.body.video;

        let old_image_public_id;
        let editedRecipe;

        recipe.findById(recipeId)
            .then(foundRecipe => {
                if (!foundRecipe) {
                    const error = new Error('Recipe does not exist, or it has been deleted.');
                    error.statusCode = 404;
                    throw error;
                }

                if(foundRecipe.image){
                    old_image_public_id = foundRecipe.image.public_id;
                }

                foundRecipe.name = name;
                foundRecipe.description = description;
                foundRecipe.ingredients = ingredients;
                foundRecipe.category = categoryId;
                foundRecipe.image = image;
                foundRecipe.video = video;

                editedRecipe = foundRecipe;
                return foundRecipe.save();
            })
            .then(result => {
                if(old_image_public_id){
                    return cloudinary.uploader.destroy(old_image_public_id);
                }
            })
            .then(result => {
                res.status(201).json({
                    message: 'Recipe updated successfully!',
                    recipe: editedRecipe
                });
            })
            .catch(err => {
                if (!err.statusCode) {
                    err.statusCode = 500;
                }
                next(err);
            });
    }
};

exports.deleteRecipe = (req, res, next) => {
    const recipeId = req.params.recipeId;
    let image_public_id;

    recipe.findById(recipeId)
        .then(foundRecipe => {
            if (!foundRecipe) {
                const error = new Error('Recipe does not exist, or it has been deleted.');
                error.statusCode = 404;
                throw error;
            }

            if(foundRecipe.image){
                image_public_id = foundRecipe.image.public_id;
            }

            return recipe.findByIdAndRemove(foundRecipe);
        })
        .then(result => {
            if(image_public_id){
                return cloudinary.uploader.destroy(image_public_id);
            }
        })
        .then(result => {
            res.status(200).json({ message: 'Recipe deleted successfully!' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getRecipes = (req, res, next) => {
    recipe.find()
        .populate('category')
        .then(recipes => {
            res.status(200).json({
                message: 'Recipes fetched successfully.',
                recipes: recipes
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getRecipe = (req, res, next) => {
    const recipeId = req.params.recipeId;
    
    recipe.findById(recipeId)
        .populate('category')
        .then(recipe => {
            res.status(200).json({
                message: 'Recipe fetched successfully.',
                recipe: recipe
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};