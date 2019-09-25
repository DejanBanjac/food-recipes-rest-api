const { validationResult } = require('express-validator/check');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const ObjectId = require('mongodb').ObjectID;

const User = require('../models/user');

const HASH_ROUNDS = 12;
const LOGIN_FAIL_MESSAGE = "Wrong password or user name";

exports.signup = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const error = new Error('Validation failed.');
        error.statusCode = 422;
        error.data = errors.array();
        throw error;
    }
    const email = req.body.email;
    const password = req.body.password;
    const firstName = req.body.firstName;
    const lastName = req.body.lastName;
    bcrypt
        .hash(password, HASH_ROUNDS)
        .then(hashedPw => {
            const user = new User({
            email: email,
            password: hashedPw,
            firstName: firstName,
            lastName :lastName
            });
            return user.save();
        })
        .then(result => {
            res.status(201).json({ message: 'User created!', userId: result._id });
        })
        .catch(err => {
            if (!err.statusCode) {
            err.statusCode = 500;
            }
            next(err);
        });
};

exports.login = (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;
    let loadedUser;
    User.findOne({ email: email })
        .then(user => {
            if (!user) {
                const error = new Error(LOGIN_FAIL_MESSAGE);
                error.statusCode = 401;
                throw error;
            }
            loadedUser = user;
            return bcrypt.compare(password, user.password);
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
            res.status(200).json({ token: token, userId: loadedUser._id.toString() });
        })
        .catch(err => {
            if (!err.statusCode) {
                err.statusCode = 500;
            }
            next(err);
        });
};

exports.addFavouriteRecipe = (req, res, next) => {
    const recipeId = req.params.recipeId;

    User.findOne({ _id: new ObjectId(req.userId) })
        .then( user => {
            if(!user){
                throw new error("Server is bussy at the moment. Please try again later.");
            }
            return user.addRecipeToFavorites(recipeId);
        })
        .then(result => {
            res.status(200).json({
                message: "Recipe successfully added to favourites!" 
            });
        })
        .catch(err => {
            const error = new Error(err);
            error.httpStatusCode = 500;
            next(error);
        })
};