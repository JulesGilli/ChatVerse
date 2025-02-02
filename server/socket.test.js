require('dotenv').config();
const io = require('socket.io');
const http = require('http');
const client = require('socket.io-client');
const mongoose = require('mongoose');
const Channel = require('./models/Channel');
const Message = require('./models/Message');
const channelManager = require('./sockets/channels');
const messageManager = require('./sockets/messages');
const connectionManager = require('./sockets/connection');

const DB_URI = process.env.ATLAS_URI;
const TEST_PORT = 3001;

describe('Socket Features Test Suite', () => {
  let httpServer, ioServer;
  let connectedUsers = [];

  const connectClient = () => client(`http://localhost:${TEST_PORT}`, {
    transports: ['websocket'],
    forceNew: true
  });

  beforeAll(async () => {
    await mongoose.connect(DB_URI);
    
    httpServer = http.createServer();
    ioServer = io(httpServer);
    
    ioServer.on('connection', (socket) => {
      connectionManager(socket, ioServer, connectedUsers);
      channelManager(socket, ioServer, connectedUsers);
      messageManager(socket, ioServer, connectedUsers);
    });

    await new Promise(resolve => httpServer.listen(TEST_PORT, resolve));
  });

  afterAll(async () => {
    await new Promise(resolve => httpServer.close(resolve));
    await mongoose.connection.close();
  });

  beforeEach(async () => {
    connectedUsers = [];
    await Channel.deleteMany();
    await Message.deleteMany();
  });

  afterEach(async () => {
    const sockets = await ioServer.fetchSockets();
    await Promise.all(sockets.map(socket => socket.disconnect(true)));
    await new Promise(resolve => setTimeout(resolve, 100));
  });

  describe('Core Functionality', () => {
    test('Full Message Flow', async () => {
      const client = connectClient();
      await new Promise(resolve => client.on('connect', resolve));
      
      await new Channel({ name: 'general', isPrivate: false }).save();
      
      const joinResponse = await new Promise(resolve => 
        client.emit('joinChannel', { name: 'general' }, resolve)
      );
      expect(joinResponse.success).toBe(true);

      const messagePromise = new Promise(resolve => client.on('newMessage', resolve));
      client.emit('sendMessage', { content: 'Test', channel: 'general' });
      
      const message = await messagePromise;
      expect(message.content).toBe('Test');
      
      const dbMessage = await Message.findOne({ content: 'Test' });
      expect(dbMessage).toBeTruthy();

      client.disconnect();
    });

    test('Error Handling', async () => {
      const client = connectClient();
      await new Promise(resolve => client.on('connect', resolve));

      await new Channel({ name: 'existing', isPrivate: false }).save();
      const errorPromise = new Promise(resolve => client.on('errors', resolve));
      client.emit('createChannel', { name: 'existing', isPrivate: false });
      
      const error = await errorPromise;
      expect(error.error).toContain('already exists');

      client.disconnect();
    });

    test('User Presence Tracking', async () => {
      const client1 = connectClient();
      const client2 = connectClient();
      
      await Promise.all([
        new Promise(resolve => client1.on('connect', resolve)),
        new Promise(resolve => client2.on('connect', resolve))
      ]);

      const initialUsers = await new Promise(resolve => client1.on('updateUsers', resolve));
      expect(initialUsers.length).toBe(2);

      client2.disconnect();
      const finalUsers = await new Promise(resolve => client1.on('updateUsers', resolve));
      expect(finalUsers.length).toBe(1);

      client1.disconnect();
    });
  });
});