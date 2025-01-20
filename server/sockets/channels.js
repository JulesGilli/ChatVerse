const Channel = require('../models/Channel');

const channelManager = (socket, io) => {
  socket.on('createChannel', async (data) => {
    try {
      const newChannel = new Channel({ name: data.name });
      await newChannel.save();
      io.emit('newChannel', newChannel);
    } catch (err) {
      console.error('Erreur lors de la création du channel :', err);
    }
  });
};

module.exports = channelManager;
