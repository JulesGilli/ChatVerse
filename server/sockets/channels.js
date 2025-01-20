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

  socket.on('getChannels', async (data) => {
    try {
      const regexFilter = new RegExp(`^${data.filter}`, 'i') || '';
      const channelList = await Channel.find({name:{ $regex: regexFilter}});
      console.log(channelList);
      socket.emit('listChannels', channelList);
    } catch (error) {
      console.error('error listing channel', err);
    }
  })

}
module.exports = channelManager;

