const connectionManager = require('./connection');
const messageManager = require('./messages');
const channelManager = require('./channels');

const setupSocketManagers = (io) => {
  io.on('connection', (socket) => {
    
    connectionManager(socket, io);

    messageManager(socket, io);

    channelManager(socket, io);
  });
};

module.exports = setupSocketManagers;
