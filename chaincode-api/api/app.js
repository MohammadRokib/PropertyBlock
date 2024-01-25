require('dotenv').config();
require('express-async-errors');

const cors = require('cors');
const passport = require('passport');

const express = require('express');
const app = express();

//-- Connect Database --\\
const connectDB = require('./db/connect.js');
const { initConnectLedger } = require('./config/fabricGateway.js');

//-- Routers --\\
const authRouter = require('./routes/authRoute.js');
const publicRoute = require('./routes/publicRoute.js');
const protectedRoute = require('./routes/protectedRoute.js');

//-- Error handler --\\
const notFoundMiddleware = require('./middleware/not-found.js');
const errorHandlerMiddleware = require('./middleware/error-handler.js');

//-- Path to global passport object into the configuration function --\\
require('./config/passport')(passport);

app.use(cors());
app.use(express.json());
app.use(passport.initialize());
app.use(express.urlencoded({ extended: true }));

//-- Routes --\\
app.use('/api/v1/auth', authRouter);
app.use('/api/v1/public', publicRoute);
app.use('/api/v1/user', passport.authenticate('jwt', {session: false}), protectedRoute);

//-- Error middleware --\\
app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);


//-- Server listener --\\
const port = process.env.PORT || 3000;
const url = process.env.MONGO_URI;

const start = async () => {
    try {
        await connectDB(url);
        const connectLedger = await initConnectLedger();
        await connectLedger();
        app.listen(port, () => {
            console.log(`Server is running on port ${port}....`);
        });
    } catch (err) {
        console.log(err);
    }
};
start();
