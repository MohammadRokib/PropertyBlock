const fs = require('fs');
const path = require('path');
const jwt = require('jsonwebtoken');
const User = require('../models/User.js');
const { UnauthenticatedError } = require('../errors');

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

const auth = (req, res, next) => {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return next (new UnauthenticatedError('Authentication invalid'));
    }

    const token = authHeader.split(' ')[1];
    try {
        const payload = jwt.verify(token, PUB_KEY, { algorithm: 'RS256' });
        req.user = {
            userId: payload.userId,
            name: payload.name,
        };
        next();
    } catch (error) {
        return next (new UnauthenticatedError('Authentication invalid'));
    }
};

module.exports = auth;
