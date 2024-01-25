const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const pathToKey = path.join(__dirname, '..', 'id_rsa_priv.pem');
const PRIV_KEY = fs.readFileSync(pathToKey, 'utf8');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please provide name'],
        trim: true,
        immutable: true,
        minlength: [3, 'Name should be at least 3 characters'],
        maxlength: [50, 'Name can not be more than 50 characters'],
    },

    email: {
        type: String,
        required: [true, 'Please provide email'],
        immutable: true,
        trim: true,
        match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            'Please provide a valid email',
        ],
        unique: true,
        immutable: true,
    },

    nid: {
        type: Number,
        required: [true, 'Please provide your NID'],
        immutable: true,
        unique: true,
    },

    type: {
        type: String,
        trim: true,
        immutable: true,
        required: [true, 'Please provide user type'],
        enum: ['user', 'mol', 'lro'],
    },

    phone: {
        type: Number,
        trim: true,
        required: [true, 'Please provide your phone number'],
    },

    addr: {
        type: String,
        trim: true,
        require: [true, 'Please provide your address'],
        minlength: [3, 'Address should be at least 3 characters'],
        maxlength: [150, 'Name can not be more than 150 characters'],
    },

    password: {
        type: String,
        immutable: true,
        required: [true, 'Please provide a password'],
        minlength: [10, 'Address should be at least 10 characters'],
        maxlength: [50, 'Name can not be more than 50 characters'],
    }
});

UserSchema.pre('save', async function(next) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
});

UserSchema.methods.createJWT = function() {
    const payload = {
        userId: this._id,
        nid: this.nid,
    }

    // const signedToken = jwt.sign({ userId: this._id, nid: this.nid }, PRIV_KEY, {
    const signedToken = jwt.sign(payload, PRIV_KEY, {
        expiresIn: '30d',
        algorithm: 'RS256'
    });

    return {
        token: `Bearer ${signedToken}`,
        expiresIn: '1d'
    }
};

UserSchema.methods.comparePassword = async function(userPassword) {
    const isMatch = await bcrypt.compare(userPassword, this.password);
    return isMatch;
};

module.exports = mongoose.model('User', UserSchema);
