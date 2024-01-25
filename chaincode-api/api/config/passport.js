const fs = require('fs');
const path = require('path');
const User = require('../models/User.js');
const JwtStrategy = require('passport-jwt').Strategy;
const ExtractJwt = require('passport-jwt').ExtractJwt;
// const { Strategy, ExtractJwt } = require('passport-jwt');

const pathToKey = path.join(__dirname, '..', 'id_rsa_pub.pem');
const PUB_KEY = fs.readFileSync(pathToKey, 'utf8');

//-- Options for JWT --\\
const options = {
    jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
    secretOrKey: PUB_KEY,
    algorithms: ['RS256']
};

const strategy = new JwtStrategy(options, (payload, done) => {

    User.findOne({ _id: payload.userId })
        .then(data => {
            if (data) {
                const user = {
                    id: data._id,
                    name: data.name,
                    nid: data.nid,
                    email: data.email,
                    phone: data.phone,
                    addr: data.addr,
                    type: data.type,
                };
                return done(null, user);
            } else {
                return done(null, false);
            }
        })
        .catch(err => done(err, null));

});

// //-- Using passport strategy --\\
// const usePassport = passport => {
//     passport.use(strategy);
// };

//-- Exports --\\
module.exports = passport => {
    passport.use(strategy);
};
