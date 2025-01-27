const Message = require('../models/Message');

const messageManager = (socket, io, connectedUsers) => {
  socket.on('sendMessage', async (data) => {
    try {
      const user = connectedUsers.find((u) => u.id === socket.id);
      const userId = user ? user.name : data.userId; 

      const newMessage = new Message({
        userId,
        content: data.content,
      });
      await newMessage.save();
      io.emit('newMessage', newMessage);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du message :", err);
    }
  });
};

module.exports = messageManager;
