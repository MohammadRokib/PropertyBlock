const User = require('../models/User.js');
const { StatusCodes } = require('http-status-codes');
const { BadRequestError, UnauthenticatedError } = require('../errors');

const register = async (req, res, next) => {
    // req.body.type = 'user';
    const user = await User.create({ ...req.body });
    const jwt = user.createJWT();
    res.status(StatusCodes.CREATED).json({ success: true, token: jwt.token });
};

const login = async (req, res, next) => {

    const { email, password } = req.body;
    if (!email || !password) {
        return next(new BadRequestError('Please provide email & password'));
    }

    //-- Checking email --\\
    const user = await User.findOne({ email });
    if (!user) {
        return next(new UnauthenticatedError('Invalid credentials'));
    }

    //-- Matching Password-\\
    const passMatch = await user.comparePassword(password);
    if (!passMatch) {
        return next(new UnauthenticatedError('Invalid credentials'));
    }

    const jwt = user.createJWT();
    console.log('Login');
    res.status(StatusCodes.OK).json({ success: true, user: user.name, role: user.type, token: jwt.token });
};

module.exports = {
    register,
    login,
};
