const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Schema = mongoose.Schema;

const userSchema = new Schema({
    firstname: {
        type: String,
        required: true
    },
    lastname: {
        type: String,
        required: true
    },
    user: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    pwd: {
        type: String,
        required: true
    },
    created: {
        type: String,
        default: Date.now
    },
    postNum: {
        type: Number,
        default: 0
    }
}, {collection: 'users'});

// Middleware
userSchema.pre('save', function(next) {
    let user = this;
    bcrypt.hash(user.pwd, 10, function (err, hash) {
        if (err) return next(err);
        user.pwd = hash;
        console.log(user);
        next();
    });
});

const user = mongoose.model('user', userSchema);

module.exports = user;