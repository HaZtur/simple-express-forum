const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const threadSchema = new Schema({
    topic: {
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
    categoryId: {
        type: Schema.Types.ObjectId,
        ref: 'category',
        required: true
    }
}, {collection: 'threads'});


const thread = mongoose.model('thread', threadSchema);

module.exports = thread;