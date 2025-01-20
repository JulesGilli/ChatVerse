export const createChannel = (socket, channelName) => {
    if (channelName && socket) {
      socket.emit('createChannel', { name: channelName });
      console.log(`Créé le canal : ${channelName}`);
    }
  };
  
  export const joinChannel = (socket, channelName) => {
    if (channelName && socket) {
      socket.emit('joinChannel', { name: channelName });
      console.log(`Rejoint le canal : ${channelName}`);
    }
  };
  