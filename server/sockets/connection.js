const Message = require('../models/Message');

let connectedUsers = [];

const connectionManager = async (socket, io) => {

  const userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);
  connectedUsers.push({ name: userName });

  io.emit('updateUsers', connectedUsers);

  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);

  socket.on('disconnect', () => {
    console.log(`${userName} s'est déconnecté`);
    connectedUsers = connectedUsers.filter((user) => user.name !== userName);
    io.emit('updateUsers', connectedUsers);
  });
};

module.exports = connectionManager;

