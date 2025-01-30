const messageManager = require('./messages'); 
const Message = require('../models/Message');

const connectionManager = async (socket, io, connectedUsers) => {
  let userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);

  connectedUsers.push({ id: socket.id, name: userName });

  setTimeout(() => {
    io.emit('updateUsers', connectedUsers);
  }, 100);

  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);

  socket.on('disconnect', () => {
    console.log(`${userName} s'est déconnecté`);

    const index = connectedUsers.findIndex((u) => u.id === socket.id);
    if (index !== -1) {
      connectedUsers.splice(index, 1);
    }

    setTimeout(() => {
      io.emit('updateUsers', connectedUsers);
    }, 50);
  });
};

module.exports = connectionManager;
