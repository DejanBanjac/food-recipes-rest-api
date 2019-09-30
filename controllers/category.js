const { validationResult } = require('express-validator/check');
const cloudinary = require('cloudinary').v2;

const recipe = require('../models/recipe');
const category = require('../models/category');

const DEFAULT_CATEGORY_NAME = 'Uncategorized';

exports.addCategory = (req, res, next) => {
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
    
        newCategory
            .save()
            .then(result => {
                res.status(201).json({
                    message: 'Category created successfully!',
                    category: newCategory
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

exports.editCategory = (req, res, next) => {
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
        const categoryId = req.params.categoryId;
        const name = req.body.name;
        let image;

        if(req.file){
            image = {                
                url: req.file.url,
                public_id: req.file.public_id
            }
        };

        let old_image_public_id;
        let editedCategory;

        category.findById(categoryId)
            .then(foundCategory => {
                if (!foundCategory) {
                    const error = new Error('Category does not exist, or it has been deleted.');
                    error.statusCode = 404;
                    throw error;
                }
                if(foundCategory.name === DEFAULT_CATEGORY_NAME){
                    const error = new Error('This category cannot be edited.');
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
                res.status(201).json({
                    message: 'Category updated successfully!',
                    category: editedCategory
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

exports.deleteCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    let image_public_id;
    let default_category_id;

    category.findOne({name: DEFAULT_CATEGORY_NAME})
        .then(foundCategory=>{
            default_category_id = foundCategory._id;
            return category.findById(categoryId);
        })    
        .then(foundCategory => {
            if (!foundCategory) {
                const error = new Error('Category does not exist, or it has been deleted.');
                error.statusCode = 404;
                throw error;
            }
            if(foundCategory.name === DEFAULT_CATEGORY_NAME){
                const error = new Error('This category cannot be deleted.');
                error.statusCode = 404;
                throw error;
            }

            if(foundCategory.image){                
                image_public_id = foundCategory.image.public_id;
            }

            return category.findByIdAndRemove(categoryId);
        })
        .then(result=>{
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
            res.status(200).json({ message: 'Category deleted successfully.' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getCategories = (req, res, next) => {
    category.find()
        .then(categories => {
            categories = categories.filter( filteredCategory => 
                filteredCategory.name!==DEFAULT_CATEGORY_NAME
            );

            res.status(200).json({
                message: 'Categories fetched successfully.',
                categories: categories
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.getCategory = (req, res, next) => {
    const categoryId = req.params.categoryId;
    
    recipe.find({ category: categoryId})
        .then(recipes => {
            res.status(200).json({
                message: 'Recipes from selected category fetched successfully.',
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