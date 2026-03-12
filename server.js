const express = require("express");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static(path.join(__dirname, "client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "client", "index.html"));
});

// Send a demo scan result every 15 seconds
setInterval(() => {
  const scan = {
    target: "example.com",
    vulnerability: "XSS",
    severity: "Medium",
    timestamp: new Date().toLocaleString()
  };

  io.emit("newScan", scan);
}, 15000);

io.on("connection", (socket) => {
  console.log("Client connected");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log("Server running on port " + PORT);
});
