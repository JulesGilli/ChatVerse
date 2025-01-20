const Message = require('../models/Message');

const messageManager= (socket, io) => {
  socket.on('sendMessage', async (data) => {
    try {
      const newMessage = new Message({
        userId: data.userId,
        content: data.content,
      });
      await newMessage.save();
      io.emit('newMessage', newMessage);
    } catch (err) {
      console.error('Erreur lors de l\'enregistrement du message :', err);
    }
  });
};

module.exports = messageManager;

