const { validationResult } = require('express-validator/check');
const cloudinary = require('cloudinary').v2;

const Recipe = require('../models/recipe');
const Category = require('../models/category');

exports.addCategory = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        cloudinary.uploader.destroy(req.file.public_id).
            then( result => {
                const error = new Error('Validation failed, entered data is incorrect.');
                error.statusCode = 422;
                next(error);
            })
    }
    else{
        const name = req.body.name;
    
        const image = {
            url: req.file.url,
            public_id: req.file.public_id
        };
    
        const category = new Category({
            name: name,
            image: image
        });
    
        category
            .save()
            .then(result => {
                res.status(201).json({
                    message: 'Category created successfully!',
                    category: category
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
        cloudinary.uploader.destroy(req.file.public_id).
            then( result => {
                const error = new Error('Validation failed, entered data is incorrect.');
                error.statusCode = 422;
                next(error);
            });
    }
    else{
        const categoryId = req.params.categoryId;
        const name = req.body.name;    
        const image = {
            url: req.file.url,
            public_id: req.file.public_id
        };

        let old_image_public_id;
        let editedCategory;

        Category.findById(categoryId)
            .then(category => {
                if (!category) {
                    const error = new Error('Category does not exist, or it has been deleted.');
                    error.statusCode = 404;
                    throw error;
                }
                old_image_public_id = category.image.public_id;
                category.name = name;
                category.image = image;
                editedCategory = category;
                return category.save();
            })
            .then(result => {
                return cloudinary.uploader.destroy(old_image_public_id);
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

    Category.findById(categoryId)
        .then(category => {
            if (!category) {
                const error = new Error('Category does not exist, or it has been deleted.');
                error.statusCode = 404;
                throw error;
            }
            image_public_id = category.image.public_id;
            return Category.findByIdAndRemove(categoryId);
        })
        .then(result => {
            return cloudinary.uploader.destroy(image_public_id);
        })
        .then(result => {
            res.status(200).json({ message: 'Deleted post.' });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
  };

exports.getCategories = (req, res, next) => {
    Category.find()
    .then(categories => {
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
    
    Recipe.find({ category: categoryId})
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