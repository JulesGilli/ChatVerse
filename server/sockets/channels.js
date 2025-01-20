const Channel = require('../models/Channel');


const channelManager = (socket, io) => {
  socket.on('createChannel', async (data) => {
    try {
      console.log(await Channel.find({name : data.name}));
      if (await Channel.find({name : data.name})!=[])
      {
        socket.emit('errors',{error: "Le channel existe déjà"});
      }
      else{
        const newChannel = new Channel({ name: data.name });
        await newChannel.save();
        io.emit('newChannel', newChannel);
      }
    } catch (err) {
      console.error('Erreur lors de la création du channel :', err);
      socket.emit('errors',{error: "Erreur lors de la création du channel"});
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
    if (await Channel.find({name: data.name})){
      socket.join(data.name);
      console.log("channel join");
    }
    else{
      socket.emit('errors',{error: "Erreur le channel n'existe pas"});
      console.log("channel not exist");
    }
  })

  socket.on('leaveChannel',async(data) => {
    if (data.name){
      socket.leave(data.name);
      console.log("channel leave");
    }
  })


}
module.exports = channelManager;

