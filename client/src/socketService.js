import { io } from 'socket.io-client';

export function createSocketConnection(
  setCurrentUserId,
  onUpdateUsers,
  handleNewMessageCallback,
  onListChannels,
  setError,
  addNotification,
  handleChannelAction,
  setChannelUsers,
  setShowUserList
) {
  const newSocket = io('http://localhost:5050');

  newSocket.on('connect', () => {
    setCurrentUserId(newSocket.id);
  });

  newSocket.on('updateUsers', onUpdateUsers);
  newSocket.on('newMessage', handleNewMessageCallback);
  newSocket.on('listChannels', onListChannels);
  newSocket.on('errors', (data) => {
    setError(`${data.error}${data.code ? ` (Code: ${data.code})` : ''}`);
    addNotification(`Error${data.code ? ` ${data.code}` : ''}: ${data.error}`);
  });
  newSocket.on('usersInChannel', setChannelUsers);
  newSocket.on('newChannel', (data) => handleChannelAction('create', data.name));
  newSocket.on('deleteChannel', (data) => handleChannelAction('delete', data.name));
  newSocket.on('nicknameChanged', () => handleChannelAction('rename'));

  return newSocket;
}