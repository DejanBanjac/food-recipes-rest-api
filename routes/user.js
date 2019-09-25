const express = require('express');
const { body } = require('express-validator/check');
const User = require('../models/User');
const userController = require('../controllers/user');
const isAuthorized = require('../middleware/authorization');

const MINIMUM_PASSWORD_LENGTH = 5; 

const router = express.Router();


router.post(
    '/signup',
    [
        body('email')
        .isEmail()
        .withMessage('Please enter a valid email.')
        .custom((value, { req }) => {
            return User.findOne({ email: value }).then(userDoc => {
                if (userDoc) {
                    return Promise.reject('E-Mail address already exists!');
                }
            });
        })
        .normalizeEmail(),
        body('password')
        .trim()
        .isLength({ min: MINIMUM_PASSWORD_LENGTH }),
        body('firstName')
        .trim()
        .not()
        .isEmpty(),
        body('lastName')
        .trim()
        .not()
        .isEmpty()
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