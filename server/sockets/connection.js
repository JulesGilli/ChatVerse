const Message = require('../models/Message');

const connectionManager = async (socket, io) => {

  const userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);

  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);

  socket.on('disconnect', () => {
    console.log(`${userName} s'est déconnecté`);
  });
};

module.exports = connectionManager;

