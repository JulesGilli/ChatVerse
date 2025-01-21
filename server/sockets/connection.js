const Message = require('../models/Message');

let connectedUsers = [];

const connectionManager = async (socket, io) => {

  let userName = `user${socket.id}`;
  console.log(`${userName} s'est connecté`);
  connectedUsers.push({ id: socket.id, name: userName });

  io.emit('updateUsers', connectedUsers);

  const messageHistory = await Message.find({});
  socket.emit('messageHistory', messageHistory);

  socket.on('changeNickname', (data) => {
    newNickname = data.name;
/*     if (!newNickname.name || newNickname.name.trim() === '') {
      socket.emit('error', 'Le pseudonyme ne peut pas être vide.');

    }else{ */
      console.log(newNickname);
      const user = connectedUsers.find((user) => user.id === socket.id);
      if (user) {
        const oldName = user.name;
        user.name = newNickname;
  
        console.log(`${oldName} a changé son nickname ${newNickname}`);
  
        io.emit('userNicknameFetch', {
          userId: socket.id,
          oldName,
          newNickname,
        });
  
        io.emit('updateUsers', connectedUsers);
      }
    }
  );
  
  socket.on('disconnect', () => {
    console.log(`${userName} s'est déconnecté`);
    connectedUsers = connectedUsers.filter((user) => user.name !== userName);
    io.emit('updateUsers', connectedUsers);
  });
};

module.exports = connectionManager;

