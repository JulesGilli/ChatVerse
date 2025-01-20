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

  socket.on('deleteChannel', async (data) => {
    try {
      const deletedChannel = await Channel.findByIdAndDelete(data.id);
      console.log("delete channels")
    } catch (err) {
      console.error('Erreur suppression du channel :', err);
    }
  });

  socket.on('joinChannel', (data) => {
    try {
      socket.join(data.channelId);
      io.to(data.channelId).emit('userJoined', { userId: socket.id, channelId: data.channelId });
    } catch (err) {
      console.error('Erreur join channel :', err);
    }
  });


  socket.on('leaveChannel', (data) => {
    try {
      socket.leave(data.channelId);
      io.to(data.channelId).emit('userLeft', { userId: socket.id, channelId: data.channelId });
    } catch (err) {
      console.error('erreur quit channel :', err);
    }
  });

  socket.on('listChannels', async () => {
    try {
      const channels = await Channel.find({});
      socket.emit('channelList', channels);
    } catch (err) {
      console.error('Erreur lists channels :', err);
    }
  });

}
module.exports = channelManager;

