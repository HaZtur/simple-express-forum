const express = require('express');
const route = express.Router();
const category = require('../modules/categories');
const thread = require('../modules/thread');
const post = require('../modules/post');
const user = require('../modules/user');


//Middleware
route.use("/", (req, res, next) =>{
    if(req.session.userId){
        next()
    }else{
        res.redirect("/");
    }
});


//Routes
route.get("/", (req, res) => {
    category.find()
        .then((cat) => {
            res.render('./home.ejs', { loggedIn: true, categories: cat });
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/error');
        })
});

route.get("/:categoryId", (req, res) => {
    let pageMax = (parseInt(req.query.page) * 10);
    
    thread.find({ categoryId : req.params.categoryId}).sort({ created:-1 }).populate('userId').populate('categoryId')
        .then((thr) => {
            res.render("./threads.ejs", { 
                loggedIn: true, 
                categoryId: req.params.categoryId, 
                threads: thr, 
                page: req.query.page || 1, 
                pageMax: pageMax});
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/error');   
        })
});

route.get("/:categoryId/newThread", (req, res) => {
    res.render("./newThread.ejs", { loggedIn: true, categoryId: req.params.categoryId });
});

route.get("/:categoryId/post/:threadId", (req, res) => {
    let pageMax = (parseInt(req.query.page) * 20);
    
    post.find({ threadId : req.params.threadId }).sort({ created: 1 }).populate('userId').populate('threadId')
        .then((pst) => {
            res.render("./posts.ejs", { 
                loggedIn: true, 
                categoryId: req.params.categoryId, 
                threadId: req.params.threadId, 
                posts: pst, 
                page: req.query.page || 1, 
                pageMax: pageMax })
        })
        .catch((err) => {
            console.log(err);
            res.redirect('/error');
        })
});


route.post("/logout", (req, res) => {
    let user = req.session.username;

    req.session.destroy((err) =>{
        if(err){
            console.log(err);
            res.redirect("/error");
        }else{
            console.log("User " + user + " logged out!");
            res.clearCookie("session");
            res.redirect("/");
        }
    })
});

route.post("/:categoryId/newThread", (req, res) => {
    const { topic, stuff } = req.body;

    const threadData = new thread({
        topic: topic,
        userId: req.session.userId,
        categoryId: req.params.categoryId
    });

    threadData.save(function(err){
        if (err){
            console.log(err);
            res.redirect('/error');
        }; 

        const postData = new post({
            content: stuff,
            userId : req.session.userId,
            threadId: threadData._id
        });

        postData.save(function(err){
            if (err){
                console.log(err);
                res.redirect('/error');
            };
            user.updateOne({ _id : req.session.userId }, { $inc: {postNum : 1 }}).exec();
        });
        
        res.redirect(`/home/${req.params.categoryId}/post/${threadData._id}?page=1`)
    });
});

route.post("/:categoryId/post/:threadId", (req, res) => {
    const { newPost } = req.body;

    const postData = new post({
        content: newPost,
        userId: req.session.userId,
        threadId: req.params.threadId
    });

    postData.save(function(err){
        if (err){
            console.log(err);
            res.redirect('/error');
        };

        user.updateOne({ _id : req.session.userId }, { $inc: {postNum : 1 }}).exec();
    });

    post.countDocuments({ threadId : req.params.threadId }, function(err, posts){
        if (err){
            console.log(err);
            res.redirect('/error');
        };

        let page = Math.ceil((posts + 1) / 20);
        
        res.redirect(`/home/${req.params.categoryId}/post/${req.params.threadId}?page=${page}#post${posts + 1}`);
    });
});

module.exports = route;