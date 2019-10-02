const express = require('express');
const { body } = require('express-validator/check');

const isAuthorized = require('../middleware/authorization');
const userController = require('../controllers/user');
const user = require('../models/user');

const MINIMUM_PASSWORD_LENGTH = 5;

const router = express.Router();

router.post(
    '/signup',
    [
        body('email')
            .isEmail()
            .withMessage('Please enter a valid email.')
            .normalizeEmail()
            .custom((value, { req }) => {
                return user.findOne({ email: value })
                    .then(userDoc => {
                        if (userDoc) {
                            return Promise.reject('User with the same e-mail address already exists!');
                        }
                    });
            }),
        body('password')
            .trim()
            .isLength({ min: MINIMUM_PASSWORD_LENGTH })
            .withMessage('Password must be at least ' + MINIMUM_PASSWORD_LENGTH + ' characters long.'),
        body('firstName')
            .trim()
            .not()
            .isEmpty()
            .withMessage('First name is required.'),
        body('lastName')
            .trim()
            .not()
            .isEmpty()
            .withMessage('Last name is required.')
    ],
    userController.signup
);

router.post('/login', userController.login);

router.get(
    '/addFavouriteRecipe/:recipeId', 
    isAuthorized, 
    userController.addFavouriteRecipe
);

module.exports = router;