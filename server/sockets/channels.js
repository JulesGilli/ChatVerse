const Channel = require('../models/Channel');

const channelsList = [];
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

  socket.on('joinChannel', async (data) => {
    try {
      if (!data.name) {
        return socket.emit('error', { message: 'Le nom du canal est requis pour rejoindre un canal.' });
      }
  
      socket.join(data.name);
  
      const joinedRooms = Array.from(socket.rooms);
      console.log(`Salons rejoints par ${socket.id} :`, joinedRooms);
      socket.emit('getJoinedRooms', joinedRooms);
    } catch (err) {
      console.error('Erreur join channel :', err);
      socket.emit('error', { message: 'Erreur lors de la jonction du canal.', error: err.message });
    }
  });

  socket.on('leaveChannel',async (data) => {
    try {
      socket.leave(data.channelId);
      io.to(data.channelId).emit('userLeft', { userId: socket.id, channelId: data.channelId });
    } catch (err) {
      console.error('erreur quit channel :', err);
    }
  });

  socket.on('listChannels', async (data) => {
    try {
      const filter = data?.filter || '';
      const regex = new RegExp(filter, 'i');
      const channels = await Channel.find({ name: { $regex: regex } });
      const formattedList = channels.map((channel) => `${channel.name}`).join(' ');
      console.log(formattedList);
      socket.emit('channelList', `/list ${formattedList}`);
    } catch (err) {
      console.error('Erreur lors de la récupération des channels :', err);
    }
  });

}
module.exports = channelManager;

