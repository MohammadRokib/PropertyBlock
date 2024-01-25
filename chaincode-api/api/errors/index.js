const UnauthenticatedError = require('./unauthenticated.js');
const BadRequestError = require('./bad-request.js');
const NotFoundError = require('./bad-request.js');
const CustomAPIError = require('./custom-api.js');

module.exports = {
    NotFoundError,
    CustomAPIError,
    BadRequestError,
    UnauthenticatedError,
};
