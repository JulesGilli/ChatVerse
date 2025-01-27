const Message = require('../models/Message');

const messageManager = (socket, io, connectedUsers) => {
  socket.on('sendMessage', async (data) => {
    try {
      const user = connectedUsers.find((u) => u.id === socket.id);
      const userId = socket.id;

      const newMessage = new Message({
        userId: socket.id,
        content: data.content,
        channel: data.channel,
      });
      await newMessage.save();

      io.to(data.channel).emit('newMessage', newMessage);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du message :", err);
    }
  });

  socket.on('privateMessage', (data) => {
    const { to, content } = data;
    const userDest = connectedUsers.find(u => u.name === to);
    if (!userDest) {
      socket.emit('errors', { error: "Utilisateur introuvable" });
      return;
    }
    const sender = connectedUsers.find(u => u.id === socket.id);
    const fromName = sender ? sender.name : "Inconnu";

    io.to(userDest.id).emit('privateMessage', {
      from: fromName,
      content
    });
  });
};

module.exports = messageManager;
