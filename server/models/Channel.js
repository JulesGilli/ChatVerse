const mongoose = require('mongoose');

const ChannelSchema = new mongoose.Schema({

    name: {
        type: String,
        required: true
    }

});

module.exports = mongoose.model('channels', ChannelSchema);