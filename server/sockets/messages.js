const Message = require('../models/Message');

// Function to get the message history for a channel
const getMessageHistory = async (channelName) => {
  try {
    // Fetch the last 50 messages (you can adjust this number)
    const messages = await Message.find({ channel: channelName }).sort({ createdAt: -1 }).limit(50);
    return messages.reverse(); // Reverse to get messages from oldest to newest
  } catch (err) {
    console.error("Erreur lors de la récupération de l'historique des messages :", err);
    return [];
  }
};

const messageManager = (socket, io, connectedUsers) => {
  socket.on('sendMessage', async (data) => {
    try {
      const user = connectedUsers.find((u) => u.id === socket.id);
      const userId = socket.id;

      // Create a new message document
      const newMessage = new Message({
        userId: socket.id,
        content: data.content,
        channel: data.channel,
      });

      // Save the message in the database
      await newMessage.save();

      // Emit the new message to all users in the channel
      io.to(data.channel).emit('newMessage', newMessage);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du message :", err);
    }
  });

  const Channel = require('../models/Channel'); // Importer le modèle de channel

  socket.on('joinChannel', async (data, callback) => {
    const channelName = data.name;
  
    try {
      const check = await Channel.findOne({ name: channelName });
      if (!check) {
        callback({ error: "Erreur : le channel n'existe pas" });
      } else {
        socket.join(channelName);
        callback({ success: true });
      }
    } catch (error) {
      console.error('Erreur lors de la recherche du channel :', error);
      callback({ error: "Erreur : une erreur est survenue lors de la recherche du channel" });
    }
  });
  
  
  socket.on('privateMessage', (data) => {
    const { to, content } = data;
    const userDest = connectedUsers.find(u => u.name === to);
    if (!userDest) {
      socket.emit('errors', { code: 404, error: "Not Found: User not found." });
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
