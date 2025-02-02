const Channel = require('../models/Channel');
const Message = require('../models/Message');

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
      return users.some((u) => u.name === user.name);
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
      listUsersConnectChannel[i].users = users.filter((u) => u.name !== username);
      io.to(channel).emit("updateUsers", listUsersConnectChannel[i].users);
    }
  }
}

function updatePseudo(socket, newName, oldName, io, connectedUsers) {
  for (let i = 0; i < listUsersConnectChannel.length; i++) {
    const channel = listUsersConnectChannel[i];
    const userIndex = channel.users.findIndex((u) => u.name === oldName);
    if (userIndex !== -1) {
      channel.users[userIndex].name = newName;
      io.to(channel.nameChannel).emit("updateUsers", channel.users);
    }
  }

  const user = connectedUsers.find((u) => u.id === socket.id);
  if (user) {
    user.name = newName;
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

  socket.on('privateMessage', async ({ to, content }) => {
    try {
      const sender = connectedUsers.find(u => u.id === socket.id);
      const recipient = connectedUsers.find(u => u.name === to);

      if (!sender || !recipient) {
        return socket.emit('errors', { error: 'User not found' });
      }

      const channelName = [sender.name, recipient.name].sort().join('_');
      
      let channel = await Channel.findOne({ name: channelName });
      if (!channel) {
        channel = new Channel({ name: channelName, isPrivate: true });
        await channel.save();
        io.emit('privateChannelCreated', { channelName });
      }

      const message = new Message({
        userId: socket.id,
        userName: sender.name,
        content,
        channel: channelName
      });
      await message.save();

      io.to(recipient.id).emit('newMessage', message);
      io.to(socket.id).emit('messageSentConfirmation', message);

    } catch (err) {
      console.error('Private message error:', err);
      socket.emit('errors', { code: 500, error: 'Internal server error' });
    }
  });
  

  socket.on('createChannel', async (data) => {
    try {
      const exist = await Channel.findOne({ name: data.name });
      if (!exist) {
        const newChannel = new Channel({ name: data.name, isPrivate: data.isPrivate });
        await newChannel.save();

        listUsersConnectChannel.push({
          nameChannel: data.name,
          users: []
        });

        io.emit('newChannel', newChannel);
      } else {
        socket.emit('errors', {
          code: 409,
          error: "Conflict: Channel already exists."
        });
      }
    } catch (err) {
      console.error('Error creating channel:', err);
      socket.emit('errors', {
        code: 500,
        error: "Internal server error: Unable to create channel."
      });
    }
  });

  socket.on('getChannels', async (data) => {
    try {
      let channelList;
      if (data && data.filter) {
        const regexFilter = new RegExp(`^${data.filter}`, 'i');
        channelList = await Channel.find({
          isPrivate: false,
          name: { $regex: regexFilter },
        });
      } else {
        channelList = await Channel.find({ isPrivate: false });
      }
      socket.emit('listChannels', channelList);
    } catch (err) {
      console.error('Error retrieving channels:', err);
      socket.emit('errors', {
        code: 500,
        error: "Internal server error: Unable to retrieve channels."
      });
    }
  });
  

  socket.on('joinChannel', async (data, callback) => {
    try {
      const channelName = data.name;
      const check = await Channel.findOne({ name: channelName });
      if (!check) {
        callback({ error: "404 channel doesn't exist" });
        return;
      }

      const user = connectedUsers.find((u) => u.id === socket.id);
      const username = user ? user.name : `user${socket.id}`;

      if (!verifUserOnListChannel({ name: username }, channelName)) {
        socket.join(channelName);
        updateListChannel(channelName, socket, io, connectedUsers);
        socket.broadcast.to(channelName).emit('notifChannel',user.name + " join the channel " + channelName);
        callback({ success: true });
      } else {
        callback({ error: "error 409: Conflict: You are already in this channel." });
      }
    } catch (error) {
      console.error('Join channel error:', error);
      callback({ error: "Internal server error: Unable to join channel." });
    }
  });

  socket.on('leaveChannel', (data) => {
    if (data.name) {
      socket.leave(data.name);
      leaveUserListForChannel(data.name, socket, io, connectedUsers);
      const user = connectedUsers.find((u) => u.id === socket.id);
      const username = user ? user.name : `user${socket.id}`;
      socket.broadcast.to(data.name).emit('notifChannel', user.name + " quit the channel " + data.name);
    }
  });

  socket.on('deleteChannel', async (data) => {
    try {
      const check = await Channel.findOne({ name: data.name });
      if (!check) {
        socket.emit('errors', {
          code: 404,
          error: "Not found: Channel does not exist."
        });
        return;
      }

      await Channel.deleteOne({ name: data.name });
      io.in(data.name).socketsLeave(data.name);

      listUsersConnectChannel = listUsersConnectChannel.filter(
        (obj) => obj.nameChannel !== data.name
      );

      io.emit('deleteChannel', { name: data.name });
    } catch (err) {
      console.error('Error deleting channel:', err);
      socket.emit('errors', {
        code: 500,
        error: "Internal server error: Unable to delete channel."
      });
    }
  });

  socket.on("listUsersInChannel", (data) => {
    const channelObject = listUsersConnectChannel.find(
      (obj) => obj.nameChannel === data.name
    );

    if (!channelObject) {
      socket.emit("errors", {
        code: 404,
        error: "Not found: Channel does not exist."
      });
      return;
    }

    socket.emit("usersInChannel", channelObject.users);
  });

  socket.on('changeNickname', (data) => {
    const newNickname = (data.name || '').trim();
    if (!newNickname) {
      socket.emit('errors', { error: "Empty nickname not allowed." });
      return;
    }

    const conflict = connectedUsers.find((u) => u.name === newNickname && u.id !== socket.id);
    if (conflict) {
      socket.emit('errors', { error: "That nickname is already in use." });
      return;
    }

    const user = connectedUsers.find((u) => u.id === socket.id);
    if (user) {
      const oldName = user.name;
      user.name = newNickname;
      updatePseudo(socket, newNickname, oldName, io, connectedUsers);
      io.emit('updateUsers', connectedUsers);
    }
  });

  socket.on("disconnecting", () => {
    for (let i = 0; i < listUsersConnectChannel.length; i++) {
      leaveUserListForChannel(listUsersConnectChannel[i].nameChannel, socket, io, connectedUsers);
    }
  });
};

module.exports = channelManager;