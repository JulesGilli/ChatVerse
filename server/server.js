require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');

const PORT = process.env.PORT || 5050;
const mongoUri = process.env.ATLAS_URI;

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // Adresse du frontend
    methods: ["GET", "POST"],
  },
});

/* const connectDb = require('./db/connection'); */

let connectedUsers = [];


app.use(cors());
app.use(express.json());

mongoose.connect(mongoUri, {})
.then(()=>console.log('mongoDb connect'))
.catch((err)=>console.error('mongoDb no connect :', err))

io.on('connection', (socket) => {
  console.log('Un user est log');
  connectedUsers.push({name: "user"+socket.id});
  
  io.emit("updateUsers", connectedUsers);
  
  socket.on('disconnect', () => {
    console.log("un user c'est déco");
    connectedUsers = connectedUsers.filter((user) => user.name !== "user"+socket.id);

    io.emit("updateUsers", connectedUsers);
  });

});

// start the Express server
server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});