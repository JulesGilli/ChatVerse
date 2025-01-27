const connectionManager = require('./connection');
const messageManager = require('./messages');
const channelManager = require('./channels');

let connectedUsers = [];

const setupSocketManagers = (io) => {
  io.on('connection', (socket) => {
    connectionManager(socket, io, connectedUsers);
    messageManager(socket, io, connectedUsers); 
    channelManager(socket, io, connectedUsers);
  });
};

module.exports = setupSocketManagers;
