const messageManager = require('./messages'); 
const Message = require('../models/Message');

let connectedUsers = [];

const connectionManager = async (socket, io) => {
  let userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);
  socket.data.userName = userName;
  connectedUsers.push({ name: userName });
 
  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);
 
  socket.on('changeNickname', async (data) => {
    const newNickname = data.name;
    const user = connectedUsers.find((user) => user.name === userName);
    if (user) {
      let lastName = user.name;
      socket.data.userName = newNickname;
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
