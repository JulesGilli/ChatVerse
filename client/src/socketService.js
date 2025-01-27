import { io } from 'socket.io-client';

export function createSocketConnection(
  setCurrentUserId,
  setUsers,
  handleNewMessageCallback,
  onListChannels,  
  setError,    
  addNotification    
) {
  const newSocket = io('http://localhost:5050');
  
  newSocket.on('connect', () => {
    setCurrentUserId(newSocket.id);
    console.log(`Connected with ID: ${newSocket.id}`);
  });

  newSocket.on('updateUsers', (data) => {
    setUsers(data);
  });

  newSocket.on('newMessage', (newMessage) => {
    handleNewMessageCallback(newMessage);
  });

  newSocket.on('listChannels', (data) => {
    if (onListChannels) {
      onListChannels(data);
    }
  });

  newSocket.on('errors', (data) => {
    const errorMessage = data.error || 'Unknown error';
    const errorCode = data.code ? ` (Code: ${data.code})` : '';
    setError(`${errorMessage}${errorCode}`);
    if (addNotification) {
      addNotification(`Error${errorCode}: ${errorMessage}`); 
    }
  });
  

  newSocket.on('usersInChannel', (users) => {
    console.log('Utilisateurs dans ce canal :', users);
  });
  newSocket.on('privateMessage', (data) => {
    console.log('Message privé reçu de :', data.from, ':', data.content);
  });

  return newSocket;
}
