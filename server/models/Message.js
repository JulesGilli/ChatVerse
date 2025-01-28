const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },

    userName: {
        type: String,
        required: true,
    },
    
    content: {
        type: String,
        required: true,
    },

    channel: {
        type: String,
        default:"general",
    },

    createdAt: {
        type: Date,
        default: Date.now,
    },
    channel: {
        type: String,
        required: false,
      }
}, {versionKey: false});

module.exports = mongoose.model('messages', MessageSchema);