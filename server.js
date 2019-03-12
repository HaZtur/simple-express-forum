const express = require('express');
const session = require('express-session');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const morgan = require('morgan');
const fs = require('fs');
const MongoStore = require('connect-mongo')(session);
const app = express();
const { 
    PORT = 5000
} = process.env;


/**
 * Mongoose Config
 */
const dbRaw = fs.readFileSync('dbAuth.json');
const dbAuth = JSON.parse(dbRaw);
const { user, pwd, url } = dbAuth;

mongoose.connect(process.env.MONGOLAB_URI || `mongodb://${user}:${pwd}@${url}`, { useNewUrlParser: true, useCreateIndex: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error: '));


/**
 * Session Config
 */
app.use(session({
    name: "session",
    resave: true,
    saveUninitialized: true,
    secret: "erittainsalainen",
    cookie: {
        sameSite: true,
        secure: false
    },
    store: new MongoStore({ mongooseConnection: db /*, ttl: 60 * 60* 5*/ })
}));


/**
 * Middleware
 */
app.use(bodyParser.urlencoded({ extended: false }));
app.use(express.static(__dirname + "/public"));
app.use(morgan('short'));

// Prevents loading restricted pages from cache (by e.g. using the back button)
app.use((req, res, next) =>{
    res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, max-stale=0, post-check=0, pre-check=0');
    next();
});


/**
 * Routes
 */
app.set('views', __dirname + '/public/html');
app.use("/", require("./routes/index.js"));
app.use("/home", require("./routes/home.js"));
app.use("/profile", require("./routes/profile.js"));
app.use("/error", require("./routes/error.js"));


console.log("Listening to port: " + PORT);
app.listen(PORT);