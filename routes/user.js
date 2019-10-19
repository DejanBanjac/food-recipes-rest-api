const express = require('express');
const { body } = require('express-validator/check');

const isAuthorized = require('../middleware/authorization');
const userController = require('../controllers/user');
const user = require('../models/user');

const MINIMUM_PASSWORD_LENGTH = 5;

const router = express.Router();

const INVALID_EMAIL_MESSAGE = 'Please enter a valid email.';
const EMAIL_ALREADY_EXISTS_MESSAGE = 'User with the same e-mail address already exists!';
const MINIMUM_PASSWORD_LENGTH_MESSAGE = 
    'Password must be at least ' 
    + MINIMUM_PASSWORD_LENGTH 
    + ' characters long.';
const FIRST_NAME_IS_REQUIRED_MESSAGE = 'First name is required.';
const LAST_NAME_IS_REQUIRED_MESSAGE = 'Last name is required.';

router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage(INVALID_EMAIL_MESSAGE)
            .normalizeEmail()
            .custom((value, { req }) => {
                return user.count({ email: value })
                    .then(count => {
                        if (count>0) {
                            return Promise.reject(EMAIL_ALREADY_EXISTS_MESSAGE);
                        }
                    });
            }),
        body('password')
            .trim()
            .isLength({ min: MINIMUM_PASSWORD_LENGTH })
            .withMessage(MINIMUM_PASSWORD_LENGTH_MESSAGE),
        body('firstName')
            .trim()
            .not()
            .isEmpty()
            .withMessage(FIRST_NAME_IS_REQUIRED_MESSAGE),
        body('lastName')
            .trim()
            .not()
            .isEmpty()
            .withMessage(LAST_NAME_IS_REQUIRED_MESSAGE)
    ],
    userController.signup
);

router.post(
    '/login',
    body('email')
        .normalizeEmail(),
    userController.login
);

router.get(
    '/add-recipe-to-favorites/:recipeId', 
    isAuthorized, 
    userController.addFavouriteRecipe
);

module.exports = router;