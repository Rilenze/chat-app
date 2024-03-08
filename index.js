const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(__dirname + "/public"));
app.use(express.static(__dirname + "/public/html"));

app.get("/", function (req, res) {
  res.sendFile(__dirname + "/public/html/chat.html");
});

// Running when client connects
io.on("connection", (socket) => {
  console.log("New web socket connection");

  socket.emit("message", "Message sent!");

  // runs when user connects
  socket.broadcast.emit("message", "A user has joined the chat");

  // runs when user disconnects
  socket.on("disconnect", () => {
    io.emit("message", "A user has left the chat");
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
