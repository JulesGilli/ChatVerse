require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
 
const PORT = process.env.PORT || 5050;
const app = express();
 
app.use(cors());
app.use(express.json());

const mongoUri = process.env.ATLAS_URI;

mongoose.connect(mongoUri, {})
.then(()=>console.log('mongoDb connect'))
.catch((err)=>console.error('mongoDb no connect :', err))

const router = require("./routes/showUser.js");

app.use("/api/users", router);

// start the Express server
app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});