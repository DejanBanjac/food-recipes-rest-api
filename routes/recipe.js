const express = require('express');
const { body } = require('express-validator/check');

const recipeController = require('../controllers/recipe');
const parser = require('../middleware/image-upload');

const recipe = require('../models/recipe');
const category = require('../models/category');

const router = express.Router();

const MIN_RECIPE_NAME_LENGHT = 3;

const MIN_RECIPE_NAME_LENGTH_MESSAGE = 
    'Name must be at least' 
    + MIN_RECIPE_NAME_LENGHT 
    + ' characters long.';
const NAME_ALREADY_RESERVED = 'Recipe with the same name already exists!';
const DESCRIPTION_MISSING = 'The recipe must have a description.';
const CATEGORY_MISSING = 'A category must be selected before the recipe could be created.';
const CATEGORY_MISSING_FROM_DB = 'Selected category does not exist, or it has been deleted.';
const VIDEO_URL_INVALID = 'Video URL must be valid.';

router.post(
    '/add-recipe',
    parser.single('image'),
    [
        body('name')
            .isString()
            .trim()
            .isLength({ min: MIN_RECIPE_NAME_LENGHT })
            .withMessage(MIN_RECIPE_NAME_LENGTH_MESSAGE)
            .custom((value, { req }) => {
                return recipe.findOne({ name: value })
                    .then(foundRecipe => {
                        if (foundRecipe) {
                            return Promise.reject(NAME_ALREADY_RESERVED);
                        }
                });
            }),
        body('description')
            .exists()
            .withMessage(DESCRIPTION_MISSING),
        body('category')
            .exists()
            .withMessage(CATEGORY_MISSING)
            .custom((value, { req }) => {
                return category.findById(value)
                    .then(foundCategory => {
                        if (!foundCategory) {
                            return Promise.reject(CATEGORY_MISSING_FROM_DB);
                        }
                });
            }),
        body('video')
            .isURL()
            .withMessage(VIDEO_URL_INVALID)
    ],
    recipeController.addRecipe
);

router.put(
    '/edit-recipe/:recipeId',
    parser.single('image'),
    [
        body('name')
            .isString()
            .trim()
            .isLength({ min: MIN_RECIPE_NAME_LENGHT })
            .withMessage(MIN_RECIPE_NAME_LENGTH_MESSAGE)
            .custom((value, { req }) => {
                return recipe.findOne({ name: value })
                    .then(foundRecipe => {
                        if (foundRecipe) {
                            return Promise.reject(NAME_ALREADY_RESERVED);
                        }
                });
            }),
        body('description')
            .exists()
            .withMessage(DESCRIPTION_MISSING),
        body('category')
            .exists()
            .withMessage(CATEGORY_MISSING)
            .custom((value, { req }) => {
                return category.findById(value)
                    .then(foundCategory => {
                        if (!foundCategory) {
                            return Promise.reject(CATEGORY_MISSING_FROM_DB);
                        }
                });
            }),
        body('video')
            .isURL()
            .withMessage(VIDEO_URL_INVALID)
    ],
    recipeController.editRecipe
);

router.delete(
    '/delete-recipe/:recipeId',
    recipeController.deleteRecipe
);

router.get(
    '/get-recipes',
    recipeController.getRecipes
);

router.get(
    '/get-recipe/:recipeId',
    recipeController.getRecipe
);

module.exports = router;
