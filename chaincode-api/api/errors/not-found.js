const { StatusCodes } = require('http-status-codes');
const CustomAPIError = require('./custom-api.js');

class NotFoundError extends CustomAPIError {
    constructor(message) {
        super(message);
        this.statusCode = StatusCodes.BAD_GATEWAY;
    }
}

module.exports = NotFoundError;
