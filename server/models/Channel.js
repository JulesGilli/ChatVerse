const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    }

}, {versionKey: false});

module.exports = mongoose.model('channels', ChannelSchema);