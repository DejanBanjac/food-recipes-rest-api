const express = require('express');
const { body } = require('express-validator/check');

const categoryController = require('../controllers/category');
const parser = require('../middleware/image-upload');

const category = require('../models/category');

const router = express.Router();

const MIN_CATEGORY_NAME_LENGTH = 3;

const MIN_CATEGORY_NAME_LENGTH_MESSAGE = 
    'Name must be at least' 
    + MIN_CATEGORY_NAME_LENGTH 
    + ' characters long.';
const NAME_ALREADY_RESERVED = 'Category with the same name already exists!';

router.post(
    '/add-category',
    parser.single('image'),
    [
        body('name')
            .isString()
            .trim()
            .isLength({ min: MIN_CATEGORY_NAME_LENGTH })
            .withMessage(MIN_CATEGORY_NAME_LENGTH_MESSAGE)
            .custom((value, { req }) => {
                return category.count({ name: value })
                    .then(count => {
                        if (count>0) {
                            return Promise.reject(NAME_ALREADY_RESERVED);
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
            .isLength({ min: MIN_CATEGORY_NAME_LENGTH })
            .withMessage(MIN_CATEGORY_NAME_LENGTH_MESSAGE)
            .custom((value, { req }) => {
                return category.count({ 
                    name: value,
                    _id: {$ne: req.params.categoryId}
                })
                .then(count => {
                    if (count>0) {
                            return Promise.reject(NAME_ALREADY_RESERVED);
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
