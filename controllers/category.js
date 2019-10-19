const { validationResult } = require('express-validator/check');
const cloudinary = require('cloudinary').v2;

const recipe = require('../models/recipe');
const category = require('../models/category');

const DEFAULT_CATEGORY_NAME = 'Uncategorized';

const VALIDATION_HAS_FAILED_MESSAGE = 'Validation has failed:';
const CATEGORY_CREATED_MESSAGE = 'Category created successfully!';
const CATEGORY_NOT_FOUND_MESSAGE = 'Category does not exist, or it has been deleted.';
const CATEGORY_CANNOT_BE_EDITED_MESSAGE = 'This category cannot be edited.';
const CATEGORY_UPDATED_MESSAGE = 'Category updated successfully!';
const CATEGORY_CANNOT_BE_DELETED_MESSAGE = 'This category cannot be deleted.';
const CATEGORY_DELETED_MESSAGE = 'Category deleted successfully.';
const CATEGORIES_FETCHED_MESSAGE = 'Categories fetched successfully.';
const CATEGORY_FETCHED_MESSAGE = 'Recipes from selected category fetched successfully.';

exports.addCategory = (req, res, next) => {
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
    let newCategory;

    if(req.file){
        const image = {
            url: req.file.url,
            public_id: req.file.public_id
        };
    
        newCategory = new category({
            name: name,
            image: image
        });
    }
    else{
        newCategory = new category({
            name: name
        });
    }

    return newCategory
        .save()
        .then(result => {
            return res.status(201).json({
                message: CATEGORY_CREATED_MESSAGE,
                category: result
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.editCategory = (req, res, next) => {
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

    const categoryId = req.params.categoryId;
    const name = req.body.name;
    let image;

    if(req.file){
        image = {                
            url: req.file.url,
            public_id: req.file.public_id
        };
    }

    let old_image_public_id;
    let editedCategory;

    return category.findById(categoryId)
        .then(foundCategory => {
            if (!foundCategory) {
                const error = new Error(CATEGORY_NOT_FOUND_MESSAGE);
                error.statusCode = 404;
                throw error;
            }

            if(foundCategory.image){
                old_image_public_id = foundCategory.image.public_id;
            }

            foundCategory.name = name;
            foundCategory.image = image;
            editedCategory = foundCategory;
            return foundCategory.save();
        })
        .then(result => {
            if(old_image_public_id){
                return cloudinary.uploader.destroy(old_image_public_id);
            }
        })            
        .then(result => {
            return res.status(201).json({
                message: CATEGORY_UPDATED_MESSAGE,
                category: editedCategory
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.deleteCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    let image_public_id;
    let default_category_id;

    return category.getDefaultCategory()
        .then(foundCategory => {
            default_category_id = foundCategory._id;
            return category.findById(categoryId);
        })
        .then(foundCategory => {
            if (!foundCategory) {
                const error = new Error(CATEGORY_NOT_FOUND_MESSAGE);
                error.statusCode = 404;
                throw error;
            }
            
            if(foundCategory.image){                
                image_public_id = foundCategory.image.public_id;
            }

            return category.findByIdAndRemove(categoryId);
        })
        .then(result => {
            return recipe.update(
                {"category": categoryId}, 
                {"$set":{"category": default_category_id}}, 
                {"multi": true}
            );
        })
        .then(result => {
            if(image_public_id){
                return cloudinary.uploader.destroy(image_public_id);
            }
        })
        .then(result => {
            return res.status(200).json({ message: CATEGORY_DELETED_MESSAGE });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.getCategories = (req, res, next) => {
    return category.find()
        .then(categories => {
            return res.status(200).json({
                message: CATEGORIES_FETCHED_MESSAGE,
                categories: categories
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.getCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    let chosenCategory;
    
    return category.findById(categoryId)
        .then(foundCategory =>{
            if (!foundCategory) {
                const error = new Error(CATEGORY_NOT_FOUND_MESSAGE);
                error.statusCode = 404;
                throw error;
            }
            chosenCategory = foundCategory;
            return recipe.find({ category: categoryId}, '_id name')
        })
        .then(recipes => {
            return res.status(200).json({
                message: CATEGORY_FETCHED_MESSAGE,
                category: chosenCategory,
                recipes: recipes
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};