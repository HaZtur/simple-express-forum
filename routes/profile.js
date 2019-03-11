const express = require('express');
const route = express.Router();
const user = require('../modules/user.js');
const bcrypt = require('bcrypt');

let inputMsg = {};


//Middleware
route.use("/", (req, res, next) =>{
    if(req.session.userId){
        next()
    }else{
        res.redirect("/");
    }
})


//Routes
route.get("/", (req, res) => {
    user.findOne({"_id" : req.session.userId})
        .then((user) => {
            res.render('./profile.ejs', { loggedIn: true, user: user, inputMsg : inputMsg });
            inputMsg = {};
        })
        .catch((err) => {
            console.log(err);
            res.redirect("/error");
            inputMsg = {};
        })
    
});

route.post("/", (req, res) => {
    const { currentPwd, newPwd, confirmPwd } = req.body;
    
    user.findOne({"_id" : req.session.userId}, (err, doc) => {
        if(err) return handleError(err);
        bcrypt.compare(currentPwd, doc.pwd, (error, result) =>{
            if(error){
                console.log(error);
                res.redirect("/profile");
            }
            else if(result){
                if(newPwd === confirmPwd){
                    bcrypt.hash(newPwd, 10, (err, hash) => {
                        if (err) return handleError(err);
                        user.updateOne({ "_id" : req.session.userId}, { $set: {pwd : hash}}).exec();
                        inputMsg.pwdUpdateSuccess = "Password updated!";
                        res.redirect("/profile");
                    })
                }else{
                    inputMsg.pwdDontMatch = "Passwords don't match!";
                    res.redirect("/profile");
                }
            }else{
                inputMsg.wrongPwd = "Wrong password!";
                res.redirect("/profile");
            }
        })
    })
});

module.exports = route;