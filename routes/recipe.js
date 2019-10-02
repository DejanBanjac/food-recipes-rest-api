const express = require('express');
const { body } = require('express-validator/check');

const recipeController = require('../controllers/recipe');
const parser = require('../middleware/image-upload');

const recipe = require('../models/recipe');
const category = require('../models/category');

const router = express.Router();

const MIN_RECIPE_NAME_LENGHT = 3;

router.post(
    '/add-recipe',
    parser.single('image'),
    (req, res, next) => {
        console.log(req.body);
        next();
    },
    [
        body('name')
            .isString()
            .trim()
            .isLength({ min: MIN_RECIPE_NAME_LENGHT })
            .withMessage('Name must be at least' + MIN_RECIPE_NAME_LENGHT + ' characters long.')
            .custom((value, { req }) => {
                return recipe.findOne({ name: value })
                    .then(foundRecipe => {
                        if (foundRecipe) {
                            return Promise.reject('Recipe with the same name already exists!');
                        }
                });
            }),
        body('description')
            .exists()
            .withMessage('The recipe must have a description.'),
        body('category')
            .exists()
            .withMessage('A category must be selected before the recipe could be created.')
            .custom((value, { req }) => {
                return category.findById(value)
                    .then(foundCategory => {
                        if (!foundCategory) {
                            return Promise.reject('Selected category does not exist, or it has been deleted.');
                        }
                });
            }),
        body('video')
            .isURL()
            .withMessage('Video URL must be valid.')
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
            .withMessage('Name must be at least', MIN_RECIPE_NAME_LENGHT, ' characters long.')
            .custom((value, { req }) => {
                return recipe.findOne({ name: value })
                    .then(foundRecipe => {
                        if (foundRecipe) {
                            return Promise.reject('Recipe with the same name already exists!');
                        }
                });
            }),
        body('description')
            .exists()
            .withMessage('The recipe must have a description.'),
        body('category')
            .exists()
            .withMessage('A category must be selected before the recipe could be created.')
            .custom((value, { req }) => {
                return category.findById(value)
                    .then(foundCategory => {
                        if (!foundCategory) {
                            return Promise.reject('Selected category does not exist, or it has been deleted.');
                        }
                });
            }),
        body('video')
            .isURL()
            .withMessage('Video URL must be valid.')
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
