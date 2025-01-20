require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const setupSocketManager = require('./sockets');
const Message = require("./models/Message");
const Channel = require("./models/Channel");

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

app.use(cors());
app.use(express.json());

mongoose.connect(mongoUri, {})
.then(()=>console.log('mongoDb connect'))
.catch((err)=>console.error('mongoDb no connect :', err));

setupSocketManager(io);


server.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});