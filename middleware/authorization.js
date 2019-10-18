const jwt = require('jsonwebtoken');

const NotAuthorized = 'Not authorized.';

module.exports = (req, res, next) => {
    const authHeader = req.get('Authorization');
    if (!authHeader) {
        const error = new Error(NotAuthorized);
        error.statusCode = 401;
        throw error;
    }
    const token = authHeader.split(' ')[1];
    let decodedToken;
    try {
        decodedToken = jwt.verify(token, process.env.JWT_SEED);
    } catch (err) {
        err.statusCode = 500;
        throw err;
    }
    if (!decodedToken) {
        const error = new Error(NotAuthorized);
        error.statusCode = 401;
        throw error;
    }
    req.userId = decodedToken.userId;
    return next();
};