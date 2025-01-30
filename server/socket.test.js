const io = require('socket.io');
const http = require('http');
const client = require('socket.io-client');

describe('Test des sockets', () => {
  let server, ioServer;
  
  beforeAll((done) => {
    const httpServer = http.createServer();
    ioServer = io(httpServer);
    
    ioServer.on('connection', (socket) => {
      socket.on('message', (data, callback) => { 
        callback(data);
      });
    });
    
    server = httpServer.listen(3000, done);
  });

  afterAll((done) => {
    ioServer.close(); 
    server.close(done);
  });

  afterEach((done) => {
    ioServer.sockets.sockets.forEach(socket => socket.disconnect(true));
    done();
  });

  test('Doit renvoyer le même message', (done) => {
    const testClient = client('http://localhost:3000', {
      transports: ['websocket'],
      forceNew: true
    });

    testClient.on('connect', () => {
      testClient.emit('message', 'test', (response) => {
        expect(response).toBe('test');
        testClient.disconnect();
        done();
      });
    });
  });

  test('Doit se déconnecter proprement', (done) => {
    const testClient = client('http://localhost:3000');
    
    testClient.on('connect', () => {
      testClient.disconnect();
      setTimeout(() => { 
        expect(testClient.connected).toBe(false);
        done();
      }, 100);
    });
  });
});