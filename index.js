const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const messageObject = require("./modules/message");
const {
  userJoin,
  userLeaves,
  getOnlineUsers,
  getCurrentUser,
  userChangeRoom,
} = require("./modules/users");
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

  socket.on("joinRoom", ({ onlineUser, room }) => {
    console.log("mujo " + room);

    if (!onlineUser) userJoin(socket.id, username, room);
    else {
      const user = getCurrentUser(socket.id);
      socket.leave(user.room);
      userChangeRoom(socket.id, room);
    }

    console.log(room);
    socket.join(room);

    socket.emit(
      "message",
      messageObject("Chat Bot", `Welcome to the ${room} chat ${username}!`)
    );

    // runs when user connects
    socket.broadcast
      .to(room)
      .emit(
        "message",
        messageObject("Chat Bot", `${username} has joined the chat`)
      );

    // Sending users to frontend
    if (room === "Global") io.emit("users", getOnlineUsers());
  });

  // catching chat message
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);
    console.log("Soba: " + user.room + ". Username: " + user.username);
    io.to(user.room).emit("message", messageObject(username, message));
  });

  // runs when user disconnects
  socket.on("disconnect", () => {
    const leavingUser = userLeaves(socket.id);

    if (leavingUser) {
      io.emit(
        "message",
        messageObject("Chat Bot", `${username} has left the chat`)
      );

      io.emit("users", getOnlineUsers());
    }
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
