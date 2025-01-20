const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    
    content: {
        type: String,
        required: true,
    },
    createAt: {
        type: Date,
        default: Date.now,
    },
}, {versionKey: false});

module.exports = mongoose.model('messages', MessageSchema);