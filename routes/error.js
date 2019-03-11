const express = require('express');
const route = express.Router();

route.get("/", (req, res) => {
    res.render("error.ejs", {loggedIn: false,})
})

module.exports = route;