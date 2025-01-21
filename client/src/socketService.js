// src/socketService.js
import { io } from 'socket.io-client';

const createSocketConnection = (setCurrentUserId, setUsers, setMessages, setHistoryMessage, setChannels, setError) => {
  const newSocket = io('http://localhost:5050');

  newSocket.on('connect', () => {
    setCurrentUserId(newSocket.id);
    console.log(`Connected with ID: ${newSocket.id}`);
  });

  newSocket.on('updateUsers', (data) => {
    setUsers(data);
  });

  newSocket.on('newMessage', (newMessage) => {
    setMessages((prevMessages) => [...prevMessages, newMessage]);
  });

  newSocket.on('messageHistory', (data) => {
    setHistoryMessage(data);
  });

  newSocket.on('listChannels', (data) => {
    setChannels(data);
  });

  newSocket.on('errors', (data) => {
    setError(data.error || 'Unknown error');
  });

  newSocket.on('userNicknameFetch', ({ userId, oldName, newNickname }) => {
    setUsers((prevUsers) =>
      prevUsers.map((user) =>
        user.id === userId ? { ...user, name: newNickname } : user
      )
    );
    console.log(`${oldName} changed their nickname to ${newNickname}`);
  });

  return newSocket;
};

export { createSocketConnection };
