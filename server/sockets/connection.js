const messageManager = require('./messages'); 
const Message = require('../models/Message');

const connectionManager = async (socket, io, connectedUsers) => {
  let userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);
  connectedUsers.push({ id: socket.id, name: userName });

  io.emit('updateUsers', connectedUsers);

  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);

  socket.on('disconnect', () => {
    console.log(`${userName} s'est déconnecté`);

    const index = connectedUsers.findIndex((user) => user.id === socket.id);

    if (index !== -1) {
      connectedUsers.splice(index, 1); 
    }

    io.emit('updateUsers', connectedUsers);
  });

};

module.exports = connectionManager;
