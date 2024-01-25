const User = require('../models/User.js');

const { StatusCodes } = require('http-status-codes');
const { NotFoundError } = require('../errors');

//-- Getting user profile --\\
const getProfile = async (req, res, next) => {
    console.log(req.user);
    res.status(StatusCodes.OK).json({ success: true, data: req.user });
};

//-- Update user profile --\\
const updateProfile = async (req, res, next) => {
    const { email } = req.user;

    let newUser = await User.findOneAndUpdate({ email }, req.body, {
        new: true,
        runValidators: true,
    });

    if (!newUser) {
        return next(new NotFoundError('User not found'));
    }
    const result = {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        nid: newUser.nid,
        userType: newUser.type,
        phone: newUser.phone,
        addr: newUser.addr,
    }
    res.status(StatusCodes.CREATED).json({ success: true, data: result });
};

module.exports = {
    getProfile,
    updateProfile,
};
