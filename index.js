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
const fs = require("fs");

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
    io.emit("restoreGlobalChat", messages);
  });

  socket.on("joinRoom", ({ username, room }) => {
    console.log("mujo " + room);

    let user = getCurrentUser(socket.id);
    if (!user) {
      user = userJoin(socket.id, username, room);
      // Sending users to frontend
      io.emit("users", getOnlineUsers());
    } else {
      socket.leave(user.room);
      userChangeRoom(socket.id, room);
    }

    socket.join(user.room);

    socket.emit(
      "message",
      messageObject(
        "Chat Bot",
        `Welcome to the ${user.room} chat ${user.username}!`
      )
    );

    // runs when user connects
    socket.broadcast
      .to(user.room)
      .emit(
        "message",
        messageObject("Chat Bot", `${user.username} has joined the chat`)
      );
  });

  // socket.on("privateRoomClick", ({ otherUserId, privateRoom }) => {
  //   const socket2 = io.sockets.sockets.get(otherUserId);
  //   const senderId = socket.id;
  //   socket2.emit("privateRoomRequest", { senderId, privateRoom });
  // });

  // socket.on("joinPrivateRoom", ({ senderId, privateRoom }) => {
  //   const socket2 = io.sockets.sockets.get(senderId);

  //   const user = getCurrentUser(socket.id);
  //   const user2 = getCurrentUser(socket2.id);
  //   socket.emit(
  //     "clearChat",
  //     messageObject(
  //       "Chat Bot",
  //       `Welcome to the private chat with ${user2.username}!`
  //     )
  //   );
  //   socket2.emit(
  //     "clearChat",
  //     messageObject(
  //       "Chat Bot",
  //       `Welcome to the private chat with ${user.username}!`
  //     )
  //   );

  //   socket.leave("Global");
  //   socket2.leave("Global");
  //   userChangeRoom(socket.id, privateRoom);
  //   userChangeRoom(socket2.id, privateRoom);
  //   socket.join(privateRoom);
  //   socket2.join(privateRoom);
  // });

  // catching chat message
  socket.on("chatMessage", (message) => {
    const user = getCurrentUser(socket.id);

    fs.readFile("public/data/messages.json", function (err, data) {
      let oldMessages = JSON.parse(data);

      const newMessages = oldMessages.filter(
        (object) => object.room === user.room
      );
      const object = {
        room: user.room,
        username: user.username,
        text: message,
      };
      newMessages.push(object);

      fs.writeFile(
        "public/data/messages.json",
        JSON.stringify(newMessages),
        function (err) {
          if (err) console.log(err);
        }
      );
    });

    console.log("Soba: " + user.room + ". Username: " + user.username);
    io.to(user.room).emit("message", messageObject(user.username, message));
  });

  // runs when user disconnects
  socket.on("disconnect", () => {
    const leavingUser = userLeaves(socket.id);

    if (leavingUser) {
      io.emit(
        "message",
        messageObject("Chat Bot", `${leavingUser.username} has left the chat`)
      );

      io.emit("users", getOnlineUsers());
    }
  });
});

server.listen(3000, () => console.log("Server running on port 3000"));
