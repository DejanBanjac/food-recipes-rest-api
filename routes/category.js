const express = require('express');
const { body } = require('express-validator/check');

const categoryController = require('../controllers/category');
const parser = require('../middleware/image-upload');

const category = require('../models/category');

const router = express.Router();

const MIN_CATEGORY_NAME_LENGHT = 3;

router.post(
    '/add-category',
    parser.single('image'),
    [
        body('name')
            .isString()
            .trim()
            .isLength({ min: MIN_CATEGORY_NAME_LENGHT })
            .withMessage('Name must be at least' + MIN_CATEGORY_NAME_LENGHT + ' characters long.')
            .custom((value, { req }) => {
                return category.findOne({ name: value })
                    .then(foundRecipe => {
                        if (foundRecipe) {
                            return Promise.reject('Category with the same name already exists!');
                        }
                });
            }),
    ],
    categoryController.addCategory
);

router.put(
    '/edit-category/:categoryId',
    parser.single('image'),
    [
        body('name')
            .isString()
            .trim()
            .isLength({ min: MIN_CATEGORY_NAME_LENGHT })
            .withMessage('Name must be at least', MIN_CATEGORY_NAME_LENGHT, ' characters long.')
            .custom((value, { req }) => {
                return category.findOne({ name: value })
                    .then(foundRecipe => {
                        if (foundRecipe) {
                            return Promise.reject('Category with the same name already exists!');
                        }
                });
            }),
    ],
    categoryController.editCategory
);

router.delete(
    '/delete-category/:categoryId',
    categoryController.deleteCategory
);

router.get(
    '/get-categories',
    categoryController.getCategories
);

router.get(
    '/get-category/:categoryId',
    categoryController.getCategory
);

module.exports = router;
