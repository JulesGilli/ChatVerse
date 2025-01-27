const Channel = require('../models/Channel');

let listUsersConnectChannel = [];

function updateListChannel(nameChannel, socket, io, connectedUsers) {
  const user = connectedUsers.find((u) => u.id === socket.id);
  const username = user ? user.name : `user${socket.id}`;

  for (let i = 0; i < listUsersConnectChannel.length; i++) {
    if (listUsersConnectChannel[i].nameChannel === nameChannel) {
      let users = listUsersConnectChannel[i].users;

      if (!users.some((u) => u.name === username)) {
        users.push({ name: username });
        listUsersConnectChannel[i].users = users;
        io.to(nameChannel).emit("updateUsers", users);
      }
    }
  }
}

function verifUserOnListChannel(user, channel) {
  for (let i = 0; i < listUsersConnectChannel.length; i++) {
    if (listUsersConnectChannel[i].nameChannel === channel) {
      let users = listUsersConnectChannel[i].users;
      for(let k=0; k<users.length; k++){
        if(users[k].name == user.name){
          return true;
        }else{
          return false;
        }
      }
    }
  }
  return false;
}

function leaveUserListForChannel(channel, socket, io, connectedUsers) {
  const user = connectedUsers.find((u) => u.id === socket.id);
  const username = user ? user.name : `user${socket.id}`;

  for (let i = 0; i < listUsersConnectChannel.length; i++) {
    if (listUsersConnectChannel[i].nameChannel === channel) {
      let users = listUsersConnectChannel[i].users;

      if (users.some((u) => u.name === username)) {
        listUsersConnectChannel[i].users = users.filter((u) => u.name !== username);
        io.to(channel).emit("updateUsers", listUsersConnectChannel[i].users);
      }
    }
  }
}

const channelManager = async (socket, io, connectedUsers) => {
  if (listUsersConnectChannel.length === 0) {
    let channels = await Channel.find({});
    for (let i = 0; i < channels.length; i++) {
      listUsersConnectChannel.push({
        nameChannel: channels[i].name,
        users: []
      });
    }
  }

  socket.on('createChannel', async (data) => {
    try {
      const exist = await Channel.findOne({ name: data.name });
      if (!exist) {
        const newChannel = new Channel({ name: data.name });
        await newChannel.save();
        listUsersConnectChannel.push({
          nameChannel: data.name,
          users: []
        });
        io.emit('newChannel', newChannel);
      } else {
        socket.emit('errors', { code: 409, error: "Conflict: Channel already exists." });
      }
    } catch (err) {
      console.error('Error creating channel:', err);
      socket.emit('errors', { code: 500, error: "Internal server error: Unable to create channel." });
    }
  });

  socket.on('getChannels', async (data) => {
    try {
      let channelList;
      if (data.filter) {
        const regexFilter = new RegExp(`^${data.filter}`, 'i');
        channelList = await Channel.find({ name: { $regex: regexFilter } });
      } else {
        channelList = await Channel.find({});
      }
      console.log("Channels found:", channelList);
      socket.emit('listChannels', channelList);
    } catch (err) {
      console.error('Error retrieving channels:', err);
      socket.emit('errors', { code: 500, error: "Internal server error: Unable to retrieve channels." });
    }
  });

  socket.on('joinChannel', async (data) => {
    const channelName = data.name;
    const check = await Channel.findOne({ name: channelName });
    if (!check) {
      socket.emit('errors', { code: 409, error: "Conflict: You are already in this channel." });
      return;
    } 

      const user = connectedUsers.find((u) => u.id === socket.id);
      const username = user ? user.name : `user${socket.id}`;

      if (!verifUserOnListChannel(username, channelName)) {
        socket.join(channelName);
        updateListChannel(channelName, socket, io, connectedUsers);
      } else {
        socket.emit('errors', { code: 409, error: "Conflict: You are already in this channel." });
      }
  });

  socket.on('leaveChannel', async (data) => {
    if (data.name) {
      socket.leave(data.name);
      console.log(`channel leave: ${data.name}`);
      leaveUserListForChannel(data.name, socket, io, connectedUsers);
    }
  });

  socket.on('deleteChannel', async (data) => {
    try {
      const check = await Channel.findOne({ name: data.name });
      if (check) {
        await Channel.deleteOne({ name: data.name });
        io.in(data.name).socketsLeave(data.name);

        listUsersConnectChannel = listUsersConnectChannel.filter(
          (obj) => obj.nameChannel !== data.name
        );
        socket.emit('errors', { code: 200, error: `Success: Channel "${data.name}" deleted.` });
      } else {
        socket.emit('errors', { code: 404, error: "Not found: Channel does not exist." });
      }
    } catch (err) {
      console.error('Error deleting channel:', err);
      socket.emit('errors', { code: 500, error: "Internal server error: Unable to delete channel." });
    }
  });

  socket.on("listUsersInChannel", (data) => {
    const channelName = data.name;
    const channelObject = listUsersConnectChannel.find(
      (obj) => obj.nameChannel === channelName
    );

    if (!channelObject) {
      socket.emit("errors", { code: 404, error: "Not found: Channel does not exist." });
      return;
    }

    const usersWithNicknames = channelObject.users.map((user) => {
      const connectedUser = connectedUsers.find((u) => u.name === user);
      return connectedUser ? connectedUser.name : user;
    });

    socket.emit("usersInChannel", usersWithNicknames);
  });

  socket.on("disconnecting", () => {
    for (let i = 0; i < listUsersConnectChannel.length; i++) {
      leaveUserListForChannel(listUsersConnectChannel[i].nameChannel, socket, io, connectedUsers);
    }
  });
};

module.exports = channelManager;