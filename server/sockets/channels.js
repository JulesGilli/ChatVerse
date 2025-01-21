const Channel = require('../models/Channel');

let listUsersConnectChannel = [];
let currentChannel;

function udpateListChannel(nameChannel, socket, io){
  for(var i = 0; i < listUsersConnectChannel.length; i++){
    if(listUsersConnectChannel[i].nameChannel == nameChannel){
      let users = listUsersConnectChannel[i].users;
      users.push("user"+socket.id);
      listUsersConnectChannel[i].users = users;
      currentChannel = listUsersConnectChannel[i];
      io.to(nameChannel).emit("updateUsers", users);
    }
  }
}

function verifUserOnListChannel(user, channel){
  for(var i=0; i<listUsersConnectChannel.length; i++){
    if(listUsersConnectChannel[i].nameChannel == channel){
      let users = listUsersConnectChannel[i].users;
      return users.includes(user);
    }
  }
}

function leaveUserListForChannel(channel, socket, io){
  let user = "user"+socket.id;
  for(var i=0; i<listUsersConnectChannel.length; i++){
    if(listUsersConnectChannel[i].nameChannel == channel){
      let users = listUsersConnectChannel[i].users;
      if(users.includes(user)){
        listUsersConnectChannel[i].users = users.filter((aUser) => aUser != user);
        socket.emit("updateUsers", []);
        io.to(channel).emit("updateUsers", listUsersConnectChannel[i].users);
      }
    }
  }
}

const channelManager = async (socket, io) => {

  io.on("connection", async () => {
    if(listUsersConnectChannel.length == 0){
      let channels = await Channel.find({});
      for(var i = 0; i < channels.length; i++){
        listUsersConnectChannel.push({
          nameChannel: channels[i].name,
          users: []
        });
      }
    }
  });

  socket.on('createChannel', async (data) => {
    try {
      const exist = await Channel.findOne({name : data.name});
      if (!exist){
        const newChannel = new Channel({ name: data.name });
        await newChannel.save();
        listUsersConnectChannel.push({
          nameChannel: data.name,
          users: []
        });
        io.emit('newChannel', newChannel);
      }
      else{
        socket.emit('errors',{error: "Erreur le channel existe déjà"});
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
    const check = await Channel.findOne({name : data.name});
    if (check){
      if(!verifUserOnListChannel("user"+socket.id, data.name)){
        socket.join(data.name);
        console.log("channel join: " + data.name);
        udpateListChannel(data.name, socket, io);
        console.log(currentChannel);
        socket.emit("currentChannel", currentChannel);
      }
      else{
        socket.emit('errors',{error: "Erreur vous avez déjà rejoins ce channel"});
      }
    }
    else{
      socket.emit('errors',{error: "Erreur le channel n'existe pas"});
    }
  })

  socket.on('leaveChannel',async(data) => {
    if (data.name){
      socket.leave(data.name);
      console.log("channel leave");
      leaveUserListForChannel(data.name, socket ,io);
      console.log(listUsersConnectChannel);
    }
  })

  socket.on("disconnecting", () => {
    for(var i = 0; i < listUsersConnectChannel.length; i++){
      leaveUserListForChannel(listUsersConnectChannel[i].nameChannel, socket, io);
    }
    console.log("azerty");
  })

}
module.exports = channelManager;

