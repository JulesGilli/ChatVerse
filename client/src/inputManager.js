// commandManager.js
export function handleCommand(input, socket, currentUserId, currentChannel) {
  const trimmedInput = input.trim();

  if (trimmedInput.startsWith('/create')) {
    const channelName = trimmedInput.split(' ')[1];
    if (channelName && socket) {
      socket.emit('createChannel', { name: channelName });
    }
  } else if (trimmedInput.startsWith('/list')) {
    const channelFilter = trimmedInput.split(' ')[1];
    socket.emit('getChannels', { filter: channelFilter });
  } else if (trimmedInput.startsWith('/join')) {
    const channelName = trimmedInput.split(' ')[1];
    socket.emit('joinChannel', { name: channelName });
  } else if (trimmedInput.startsWith('/quit')) {
    const channelName = trimmedInput.split(' ')[1];
    socket.emit('leaveChannel', { name: channelName });
  } else if (trimmedInput.startsWith('/delete')) {
    const channelName = trimmedInput.split(' ')[1];
    socket.emit('deleteChannel', { name: channelName });
  } else if (trimmedInput.startsWith('/nick')) {
    const nickName = trimmedInput.split(' ')[1];
    console.log(nickName);
    socket.emit('changeNickname', { name: nickName });
  } else {
    if (trimmedInput && socket) {
      socket.emit('sendMessage', {
        userId: `user${currentUserId}`,
        content: trimmedInput,
        channel: currentChannel
      });
    }
  }
}
