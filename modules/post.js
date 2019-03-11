const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const postSchema = new Schema({
    content: {
        type: String,
        required: true
    },
    created: {
        type: String,
        default: Date.now
    },
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'user',
        required: true
    },
    threadId: {
        type: Schema.Types.ObjectId,
        ref: 'thread',
        required: true
    }
}, {collection: 'posts'});


const post = mongoose.model('post', postSchema);

module.exports = post;