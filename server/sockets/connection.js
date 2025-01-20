let connectedUsers = [];

const connectionManager = (socket, io) => {

  const userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);
  connectedUsers.push({ name: userName });

  io.emit('updateUsers', connectedUsers);

  socket.on('disconnect', () => {
    console.log(`${userName} s'est déconnecté`);
    connectedUsers = connectedUsers.filter((user) => user.name !== userName);
    io.emit('updateUsers', connectedUsers);
  });
};

module.exports = connectionManager;

