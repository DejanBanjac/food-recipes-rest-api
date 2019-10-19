const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const user = require('../models/user');

const HASH_ROUNDS = 12;

const LOGIN_FAIL_MESSAGE = 'Wrong password or user name';
const VALIDATION_HAS_FAILED_MESSAGE = 'Validation has failed:';
const USER_CREATED_MESSAGE = 'User created successfully!';
const USER_NOT_FOUND_MESSAGE = 'User cannot be found.';
const RECIPE_FAVOURED_MESSAGE = 'Recipe successfully added to favourites!';

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error(
            VALIDATION_HAS_FAILED_MESSAGE 
            + errors.array().map(error => '\n' + error.msg)
        );
        error.statusCode = 422;
        
        return next(error);
    }
    
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;

    return bcrypt
        .hash(password, HASH_ROUNDS)
        .then(hashedPw => {
            const newUser = new user({
                email: email,
                password: hashedPw,
                firstName: firstName,
                lastName :lastName
            });
            return newUser.save();
        })
        .then(result => {
            return res.status(201).json({ 
                message: USER_CREATED_MESSAGE, 
                userId: result._id 
            });
        })
        .catch(err => {
            if (!err.statusCode) {
            err.statusCode = 500;
            }
            return next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;

    return user.findOne({ email: email })
        .then(foundUser => {
            if (!foundUser) {
                const error = new Error(LOGIN_FAIL_MESSAGE);
                error.statusCode = 401;
                throw error;
            }
            loadedUser = foundUser;
            return bcrypt.compare(password, foundUser.password);
        })
        .then(isEqual => {
            if (!isEqual) {
                const error = new Error(LOGIN_FAIL_MESSAGE);
                error.statusCode = 401;
                throw error;
            }
            const token = jwt.sign(
                {
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
                },
                process.env.JWT_SEED,
                { expiresIn: '1h' }
            );
            return res.status(200).json({ 
                token: token, 
                userId: loadedUser._id.toString()
            });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            return next(err);
        });
};

exports.addFavouriteRecipe = (req, res, next) => {
    const recipeId = req.params.recipeId;
    const userId = req.userId;

    return user.findById(userId)
        .then( foundUser => {
            if(!foundUser){
                throw new error(USER_NOT_FOUND_MESSAGE);
            }
            return foundUser.addRecipeToFavorites(recipeId);
        })
        .then(result => {
            return res.status(200).json({
                message: RECIPE_FAVOURED_MESSAGE
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            return next(error);
        })
};