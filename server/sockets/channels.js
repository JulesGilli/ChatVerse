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

      if (users.some((u) => u.name === username)) {
        listUsersConnectChannel[i].users = users.filter((u) => u.name !== username);
        io.to(channel).emit("updateUsers", listUsersConnectChannel[i].users);
      }
    }
  }
}

function updatePseudo(socket, newName, oldName, io, connectedUsers) {
  // Parcourt tous les channels pour mettre à jour le pseudo de l'utilisateur
  for (const channel of listUsersConnectChannel) {
    const userIndex = channel.users.findIndex((u) => u.name === oldName);

    if (userIndex !== -1) {
      channel.users[userIndex].name = newName;
      io.to(channel.nameChannel).emit("updateUsers", channel.users);
    }
  }

  // Met à jour le pseudo également dans connectedUsers
  const user = connectedUsers.find((u) => u.id === socket.id);
  if (user) {
    user.name = newName; // Mise à jour du pseudo dans connectedUsers
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
        socket.emit('errors', { error: "Erreur : le channel existe déjà" });
      }
    } catch (err) {
      console.error('Erreur lors de la création du channel :', err);
      socket.emit('errors', { error: "Erreur lors de la création du channel" });
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
      socket.emit('listChannels', channelList);
    } catch (err) {
      console.error('Erreur lors de la récupération des channels :', err);
    }
  });

  socket.on('joinChannel', async (data) => {
    const channelName = data.name;
    const check = await Channel.findOne({ name: channelName });
    if (!check) {
      socket.emit('errors', { error: "Erreur : le channel n'existe pas" });
      return;
    } else {

      const user = connectedUsers.find((u) => u.id === socket.id);
      const username = user ? user.name : `user${socket.id}`;

      if (!verifUserOnListChannel({ name: username }, channelName)) {
        socket.join(channelName);
        updateListChannel(channelName, socket, io, connectedUsers);
      } else {
        socket.emit('errors', { error: "Erreur : vous avez déjà rejoint ce channel" });
      }
    }
  });

  socket.on('leaveChannel', async (data) => {
    if (data.name) {
      socket.leave(data.name);
      leaveUserListForChannel(data.name, socket, io, connectedUsers);
    }
  });

  socket.on('deleteChannel', async (data) => {
    const check = await Channel.findOne({ name: data.name });
    if (check) {
      await Channel.deleteOne({ name: data.name });
      io.in(data.name).socketsLeave(data.name);

      listUsersConnectChannel = listUsersConnectChannel.filter(
        (obj) => obj.nameChannel !== data.name
      );
    }
  });

  socket.on("listUsersInChannel", (data) => {
    const channelName = data.name;
    const channelObject = listUsersConnectChannel.find(
      (obj) => obj.nameChannel === channelName
    );

    if (!channelObject) {
      socket.emit("errors", { error: "Ce canal n'existe pas." });
      return;
    }

    socket.emit("usersInChannel", channelObject.users);
  });

 
socket.on('changeNickname', (data) => {
  const newNickname = data.name.trim();
  if (!newNickname) {
    socket.emit('errors', { error: "Pseudo vide non autorisé" });
    return;
  }

  const conflict = connectedUsers.find((u) => u.name === newNickname);
  if (conflict) {
    socket.emit('errors', { error: "Ce pseudo est déjà utilisé." });
    return;
  }

  const user = connectedUsers.find((u) => u.id === socket.id);
  if (user) {
    const oldName = user.name;
    user.name = newNickname;
    updatePseudo(socket, newNickname, oldName, io, connectedUsers); // Passer connectedUsers ici
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
