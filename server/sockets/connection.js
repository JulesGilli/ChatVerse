const messageManager = require('./messages'); 
const Message = require('../models/Message');

const connectionManager = async (socket, io, connectedUsers) => {
  let userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);
  socket.data.userName = userName;
  connectedUsers.push({ id: socket.id, name: userName });

  io.emit('updateUsers', connectedUsers);

  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);

  socket.on('changeNickname', (data) => {
    const newNickname = data.name.trim();
    if (!newNickname) {
      socket.emit('errors', { code: 400, error: "Invalid nickname: Nickname cannot be empty." });
      return;
    }

    const conflict = connectedUsers.find((u) => u.name === newNickname);
    if (conflict) {
      socket.emit('errors', { code: 409, error: "Conflict: Nickname already in use." });
      return;
    }

    const user = connectedUsers.find((u) => u.id === socket.id);
    if (user) {
      user.name = newNickname;
      io.emit('updateUsers', connectedUsers);
      socket.data.userName = newNickname;
    }
  });

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
