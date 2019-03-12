const express = require('express');
const bcrypt = require('bcrypt');
const route = express.Router();
const user = require('../modules/user');

let inputMsg = {};

//MiddleWare
const redirectHome = (req, res, next) =>{
    if(req.session.userId){
        res.redirect("/home");
    }else{
        next();
    }
};

const nameValidation = (req, res, next) =>{
    // Most of the validation is done by using regular expressions
    const format = /^[A-Za-zÄÖÅäöå-]+/;
    let { firstname, lastname } = req.body;

    if(format.test(firstname) && format.test(lastname) && firstname.length > 1 && lastname.length > 1){
        next();
    }else{
        inputMsg.invalidName = "Invalid name!";
        res.redirect("/register");
    }
    
};

const usernameValidation = (req, res, next) => {
    const format = /^\w+/;
    let { username } = req.body;
    
    user.findOne({ "user" : username }, (err, doc) =>{
        if(err) return console.error(err);
        if(doc && doc.user === username){
            inputMsg.invalidUsername = "Username already in use!";
            res.redirect("/register");
        }else if(format.test(username) && username.length > 1){
            next();
        }else{
            inputMsg.invalidUsername = "Invalid username!";
            res.redirect("/register");
        }
    });
};

const emailValidation = (req, res, next) =>{
    const format = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
    let { email } = req.body;
    
    user.findOne({ "email" : email }, (err, doc) => { 
        if(err) return console.error(err);
        if(doc && doc.email === email){
            inputMsg.invalidEmail = "E-mail already in use!";
            res.redirect("/register");
        }else if(format.test(email)){
            next();
        }else{
            inputMsg.invalidEmail = "Invalid e-mail!";
            res.redirect("/register");
        }
    });
};

const passwordValidation = (req, res, next) => {
    const {password, passwordAgain} = req.body;

    if(password.length > 4){
        if(password === passwordAgain){
            next();
        }else{
            inputMsg.pwdMatch = "Password doesn't match!";
            res.redirect("/register");
        }
    }else{
        inputMsg.pwdCharLimit = "Password must be 5 chars or more!";
        res.redirect("/register");
    }
};


//Routing
route.get("/", redirectHome, (req, res) => {
    res.render('index.ejs', { loggedIn: false, inputMsg: inputMsg });
    inputMsg = {};
});

route.get("/register", redirectHome, (req, res) => {
    res.render('register.ejs', { loggedIn: false, inputMsg: inputMsg });
    inputMsg = {};
});


route.post("/login", (req, res) => {
    const { username, password } = req.body;
    
    user.findOne({"user" : username}).exec(function(err, doc) {
        if (!doc) {
            inputMsg.invalidLogin = "Invalid login!";
            res.redirect("/");
            res.end();
        }else{
            bcrypt.compare(password, doc.pwd, (error, result) =>{
                if(error){
                    console.log(error);
                    res.redirect("/");
                }else if(result){
                    req.session.userId = doc.id;
                    req.session.username = doc.user;
                    console.log("User " + username + " logged in!");
                    res.redirect("/home");
                }else{
                    inputMsg.invalidLogin = "Invalid login!";
                    res.redirect("/");
                }
            })
        } 
    })
});

route.post("/register", redirectHome, nameValidation, usernameValidation, emailValidation, passwordValidation, (req, res) => {
    const { firstname, lastname, username, password, email } = req.body;

    const userData = new user({
        firstname: firstname,
        lastname: lastname,
        user: username,
        email: email,
        pwd: password,
    });
    userData.save();

    inputMsg.accountCreated = "Account created successfully!";
    res.redirect("/");
})

module.exports = route;