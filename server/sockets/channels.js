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
      let channelList;
      if(data.filter){
        const regexFilter = new RegExp(`^${data.filter}`, 'i');
        channelList = await Channel.find({name:{ $regex: regexFilter}});
      }else{
        channelList = await Channel.find({});
      }
      console.log(channelList);
      socket.emit('listChannels', channelList);
    } catch (error) {
      console.error('error listing channel', err);
    }
  })

  socket.on('joinChannel',async(data) => {
    if (data.name){
      socket.join(data.name);
      console.log("channel join");
    }
  })


}
module.exports = channelManager;

