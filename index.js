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
const fs = require("fs");

let username = null;

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
  fs.readFile("public/data/messages.json", (error, data) => {
    const messages = JSON.parse(data);
    console.log(messages);
  });

  if (!username) {
    console.log("Treba username");
    username = usernameGenerator.generateUsername();
    socket.emit("username", username);
  }

  socket.on("joinRoom", ({ onlineUser, room }) => {
    console.log("mujo " + room);

    if (!onlineUser) userJoin(socket.id, username, room);
    // else {
    //   const user = getCurrentUser(socket.id);
    //   socket.leave(user.room);
    //   userChangeRoom(socket.id, room);
    // }

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
    if (!onlineUser) io.emit("users", getOnlineUsers());
  });

  socket.on("privateRoomClick", ({ otherUserId, privateRoom }) => {
    const socket2 = io.sockets.sockets.get(otherUserId);
    const senderId = socket.id;
    socket2.emit("privateRoomRequest", { senderId, privateRoom });
  });

  socket.on("joinPrivateRoom", ({ senderId, privateRoom }) => {
    const socket2 = io.sockets.sockets.get(senderId);

    const user = getCurrentUser(socket.id);
    const user2 = getCurrentUser(socket2.id);
    socket.emit(
      "clearChat",
      messageObject(
        "Chat Bot",
        `Welcome to the private chat with ${user2.username}!`
      )
    );
    socket2.emit(
      "clearChat",
      messageObject(
        "Chat Bot",
        `Welcome to the private chat with ${user.username}!`
      )
    );

    socket.leave("Global");
    socket2.leave("Global");
    userChangeRoom(socket.id, privateRoom);
    userChangeRoom(socket2.id, privateRoom);
    socket.join(privateRoom);
    socket2.join(privateRoom);
  });

  // catching chat message
  socket.on("chatMessage", (message) => {
    fs.readFile("public/data/messages.json", function (err, data) {
      let oldMessages = JSON.parse(data);
      const object = {
        username: username,
        text: message,
      };
      oldMessages.push(object);

      fs.writeFile(
        "public/data/messages.json",
        JSON.stringify(oldMessages),
        function (err) {
          if (err) console.log(err);
        }
      );
    });

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
