const express = require("express");
const app = express();
const rateLimit = require("express-rate-limit");
const xss = require("xss-clean");
const sanitize = require("express-mongo-sanitize");
const httpParametersPollution = require("hpp");
const morgan = require('morgan');
const customError = require('./Utils/customError');
const globalErrorHandler = require('./Controllers/errorController');
const moviesRouter = require('./Routes/moviesRoutes');
const authRouter = require('./Routes/authRoutes');
const userRouter = require('./Routes/userRoutes');
const cors = require('cors');
const bodyParser = require('body-parser');  // Importing body-parser

let limiter = rateLimit({
    max: 100,
    windowMs: 15 * 60 * 1000, 
    message: "Too many requests from this IP, please try again after 15 minutes",
});

app.use('/api', limiter);

app.use(morgan('dev')); // Logging HTTP requests
// Body-parser added to handle URL encoded and JSON body parsing
app.use(bodyParser.json({limit: '10MB'})); // Limit JSON size to 10MB
app.use(bodyParser.urlencoded({ extended: true })); // To handle form data parsing

app.use(sanitize());  // Prevent NoSQL injections
app.use(xss());  // Prevent XSS attacks
app.use(httpParametersPollution({
    whitelist: ['duration', 'ratings', 'releaseYear'],
}));  // Prevent HTTP Parameter Pollution attacks

app.use(cors()); // Enable CORS with various options

app.use("/api/v1/movies", moviesRouter);
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", userRouter);

app.all('*', (req, res, next) => {
    const err = new customError(`Can't find ${req.originalUrl} on this server`, 404);
    next(err);
});

app.use(globalErrorHandler);

module.exports = app;
