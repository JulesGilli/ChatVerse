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

describe('Test des sockets - Channel, Message, et Connection Manager', () => {
  let server, ioServer;
  const connectedUsers = [];

  // Increase the global timeout for hooks and tests
  jest.setTimeout(30000);

  beforeAll(async () => {
    await mongoose.connect(DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connecté à MongoDB pour les tests');

    const httpServer = http.createServer();
    ioServer = io(httpServer);
    ioServer.on('connection', (socket) => {
      channelManager(socket, ioServer, connectedUsers);
      messageManager(socket, ioServer, connectedUsers);
      connectionManager(socket, ioServer, connectedUsers);
    });
    // Store the server instance to close later
    server = await new Promise((resolve) => httpServer.listen(3000, resolve));
  });

  afterAll(async () => {
    ioServer.close();
    await new Promise((resolve) => server.close(resolve));
    await mongoose.connection.close();
  });

  afterEach(async () => {
    // ATTENTION: These operations clear your collections from your production DB!
    await Message.deleteMany({});
    await Channel.deleteMany({});
    ioServer.sockets.sockets.forEach((socket) => socket.disconnect(true));
  });

  test('Doit envoyer et recevoir un message dans un canal et sauvegarder en DB', (done) => {
    const testClient = client('http://localhost:3000', {
      transports: ['websocket'],
      forceNew: true,
    });
    testClient.on('connect', () => {
      testClient.emit('sendMessage', {
        content: 'Hello, World!',
        channel: 'general',
      });
      testClient.on('newMessage', (message) => {
        try {
          expect(message.content).toBe('Hello, World!');
          expect(message.channel).toBe('general');
          // Wait briefly to allow the DB insertion to complete
          setTimeout(async () => {
            try {
              const savedMessage = await Message.findOne({ content: 'Hello, World!' });
              expect(savedMessage).toBeTruthy();
              expect(savedMessage.content).toBe('Hello, World!');
              testClient.disconnect();
              done();
            } catch (dbErr) {
              testClient.disconnect();
              done(dbErr);
            }
          }, 500);
        } catch (err) {
          testClient.disconnect();
          done(err);
        }
      });
    });
  }, 10000);

  test("Doit récupérer l'historique des messages d'un canal", (done) => {
    const testClient = client('http://localhost:3000', {
      transports: ['websocket'],
      forceNew: true,
    });
    const channelName = 'general';
    const userName = 'user1';
    const messageData = {
      content: 'Test message history',
      channel: channelName,
    };
    new Message({
      userId: 'user1',
      userName,
      content: messageData.content,
      channel: messageData.channel,
    })
      .save()
      .then(() => {
        testClient.on('connect', () => {
          testClient.emit('getMessageHistory', { channel: channelName });
          testClient.on('messageHistory', (messages) => {
            try {
              expect(messages.length).toBeGreaterThan(0);
              expect(messages[0].content).toBe(messageData.content);
              testClient.disconnect();
              done();
            } catch (error) {
              testClient.disconnect();
              done(error);
            }
          });
        });
      })
      .catch((err) => done(err));
  }, 10000);

  
});
