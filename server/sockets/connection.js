const Message = require('../models/Message');

const connectionManager = async (socket, io) => {

  let userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);
  connectedUsers.push({ id: socket.id, name: userName });

  io.emit('updateUsers', connectedUsers);

  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);

  socket.on('changeNickname', (data) => {
    newNickname = data.name;
    const user = connectedUsers.find((user) => user.id === socket.id);
    if (user){
      user.name = newNickname;
    }
    io.emit('updateUsers', connectedUsers);
  }
);
  
  socket.on('disconnect', () => {
    console.log(connectedUsers);
    console.log(`${userName} s'est déconnecté`);
    connectedUsers = connectedUsers.filter((user) => user.id !== socket.id);
    console.log(connectedUsers);
    io.emit('updateUsers', connectedUsers);
  });
};

module.exports = connectionManager;

