import { io } from 'socket.io-client';

const SOCKET_URL = 'http://localhost:5050';

let socket;

export const initSocket = () => {
  socket = io(SOCKET_URL);
  console.log('Socket initialisé');
  return socket;
};

export const disconnectSocket = (socketInstance) => {
  if (socketInstance) {
    socketInstance.disconnect();
    console.log('Socket déconnecté');
  }
};

export const getSocket = () => socket;
