const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api.js');

class UnauthenticatedError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.BAD_GATEWAY;
    }
}

module.exports = UnauthenticatedError;
