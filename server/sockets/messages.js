const Message = require('../models/Message');

const getMessageHistory = async (channelName) => {
  try {

    const messages = await Message.find({ channel: channelName }).sort({ createdAt: -1 }).limit(50);
    return messages.reverse(); 
  } catch (err) {
    console.error("Erreur lors de la récupération de l'historique des messages :", err);
    return [];
  }
};

const messageManager = (socket, io, connectedUsers) => {
  socket.on('sendMessage', async (data) => {
    try {
      const user = connectedUsers.find((u) => u.id === socket.id);
      console.log(user);
      const userId = socket.id;
      const newMessage = new Message({
        userId: socket.id,
        userName: user.name,
        content: data.content,
        channel: data.channel,
      });

      await newMessage.save();

      io.to(data.channel).emit('newMessage', newMessage);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du message :", err);
    }
  });
};

module.exports = messageManager;
