const { validationResult } = require('express-validator/check');
const cloudinary = require('cloudinary').v2;

const recipe = require('../models/recipe');

const VALIDATION_HAS_FAILED_MESSAGE = 'Validation has failed:';
const RECIPE_CREATED_MESSAGE = 'Recipe created successfully!';
const RECIPE_NOT_FOUND_MESSAGE = 'Recipe does not exist, or it has been deleted.';
const RECIPE_UPDATED_MESSAGE = 'Recipe updated successfully!';
const RECIPE_DELETED_MESSAGE = 'Recipe deleted successfully!';
const RECIPES_FETCHED_MESSAGE = 'Recipes fetched successfully.';
const RECIPE_FETCHED_MESSAGE = 'Recipe fetched successfully.';

exports.addRecipe = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(
            VALIDATION_HAS_FAILED_MESSAGE 
            + errors.array().map(error => '\n' + error.msg)
        );
        error.statusCode = 422;
        
        if(req.file){
            return cloudinary.uploader.destroy(req.file.public_id).
                then( result => {
                    return next(error);
                });
        }
        else{
            return next(error);
        }
    }
    
    const name = req.body.name;
    const description = req.body.description;
    const ingredients = req.body.ingredients;
    const categoryId = req.body.category;    

    const newRecipe = new recipe({
        name: name,
        description: description,
        ingredients: ingredients,
        category: categoryId
    });

    if(req.file){
        const image = {                
            url: req.file.url,
            public_id: req.file.public_id
        }
        newRecipe.image = image;
    };
    if(req.body.video){
        newRecipe.video = req.body.video;
    }

    return newRecipe
        .save()
        .then(savedRecipe=>{
            return savedRecipe
                .populate('category', '_id name image')
                .execPopulate();
        })
        .then(populatedRecipe => {
            return res.status(201).json({
                message: RECIPE_CREATED_MESSAGE,
                recipe: populatedRecipe
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.editRecipe = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(
            VALIDATION_HAS_FAILED_MESSAGE 
            + errors.array().map(error => '\n' + error.msg)
        );
        error.statusCode = 422;
        
        if(req.file){
            return cloudinary.uploader.destroy(req.file.public_id).
                then( result => {
                    return next(error);
                });
        }
        else{
            return next(error);
        }
    }
    
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

    return recipe.findById(recipeId)
        .then(foundRecipe => {
            if (!foundRecipe) {
                const error = new Error(RECIPE_NOT_FOUND_MESSAGE);
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
            return res.status(201).json({
                message: RECIPE_UPDATED_MESSAGE,
                recipe: editedRecipe
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.deleteRecipe = (req, res, next) => {
    const recipeId = req.params.recipeId;
    let image_public_id;

    return recipe.findById(recipeId)
        .then(foundRecipe => {
            if (!foundRecipe) {
                const error = new Error(RECIPE_NOT_FOUND_MESSAGE);
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
            return res.status(200).json({ message: RECIPE_DELETED_MESSAGE });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.getRecipes = (req, res, next) => {
    return recipe.find()
        .populate('category', '_id name image')
        .then(foundRecipes => {
            return res.status(200).json({
                message: RECIPES_FETCHED_MESSAGE,
                recipes: foundRecipes
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.getRecipe = (req, res, next) => {
    const recipeId = req.params.recipeId;
    
    return recipe.findById(recipeId)
        .populate('category', '_id name image')
        .then(recipe => {
            return res.status(200).json({
                message: RECIPE_FETCHED_MESSAGE,
                recipe: recipe
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};