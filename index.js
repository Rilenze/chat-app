const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const messageObject = require("./modules/message");
const { userJoin, userLeaves, getRoomUsers } = require("./modules/users");
const usernameGenerator = require("username-generator");

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
  const username = usernameGenerator.generateUsername();

  socket.emit("username", username);

  socket.on("joinRoom", (room) => {
    console.log("mujo " + room);

    const user = userJoin(socket.id, username, room);

    socket.join(user.room);

    socket.emit(
      "message",
      messageObject("Chat Bot", `Welcome to the ${room} chat ${username}!`)
    );

    // runs when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        messageObject("Chat Bot", `${username} has joined the chat`)
      );

    // Sending users to frontend
    io.emit("users", getRoomUsers(user.room));
  });

  // catching chat message
  socket.on("chatMessage", (message) => {
    io.emit("message", messageObject(username, message));
  });

  // runs when user disconnects
  socket.on("disconnect", () => {
    const leavingUser = userLeaves(socket.id);

    if (leavingUser) {
      io.emit(
        "message",
        messageObject("Chat Bot", `${username} has left the chat`)
      );

      io.emit("users", getRoomUsers(leavingUser.room));
    }
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
