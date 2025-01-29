const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    },

    isPrivate: {
        type: Boolean,
        required: true
    }

}, {versionKey: false});

module.exports = mongoose.model('channels', ChannelSchema);