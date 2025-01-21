// src/socketService.js
import { io } from 'socket.io-client';

const createSocketConnection = (setCurrentUserId, setUsers, setMessages, setHistoryMessage, setChannels, setError) => {
  const newSocket = io('http://localhost:5050');

  newSocket.on('connect', () => {
    setCurrentUserId(newSocket.id);
    console.log(`Connected with ID: ${newSocket.id}`);
  });

  newSocket.on('updateUsers', (data) => {
    console.log(data);
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

  return newSocket;
};

export { createSocketConnection };
