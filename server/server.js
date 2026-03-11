require('dotenv').config();
const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

const adminRoutes = require('./routes/admin');

app.use(express.json());
app.use('/admin', adminRoutes);
app.use(express.static('client'));

io.on('connection', (socket) => {
  console.log('Client connected');
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log('FMDash running on port', PORT);
});
