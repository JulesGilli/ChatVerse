const messageManager = require('./messages'); 
const Message = require('../models/Message');

let connectedUsers = [];

const connectionManager = async (socket, io) => {
  let userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);
  connectedUsers.push({ name: userName });
 
  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);
 
  socket.on('changeNickname', (data) => {
    const newNickname = data.name;
    const user = connectedUsers.find((user) => user.name === userName);
    if (user) {
      let lastName = user.name;
      user.name = newNickname;
      userName = newNickname;
      io.emit('updateUsers', connectedUsers);
      socket.emit('updateUsername', userName, lastName);
    }
  });

  socket.on('disconnect', () => {
    console.log(`${userName} s'est déconnecté`);
    connectedUsers = connectedUsers.filter((user) => user.name !== userName);
    io.emit('updateUsers', connectedUsers);
  });

  messageManager(socket, io, connectedUsers);
};
 
module.exports = connectionManager;
