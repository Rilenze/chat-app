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
  getUserByUsername,
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
  socket.on("joinRoom", ({ username, room }) => {
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

    fs.readFile("public/data/messages.json", (error, data) => {
      const allMessages = JSON.parse(data);
      const roomMessages = allMessages.filter(
        (message) => message.room === user.room
      );
      socket.emit("restoreGlobalChat", roomMessages);

      socket.emit(
        "message",
        messageObject(
          "Chat Bot",
          `Welcome to the ${user.room} chat ${user.username}!`
        )
      );
    });

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

      const object = {
        room: user.room,
        username: user.username,
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

    if (user.room !== "Global") {
      const privateChatUsernames = user.room.split("&");
      const username1 = privateChatUsernames[0];
      const username2 = privateChatUsernames[1];
      let reciever = null;
      if (user.username === username1) {
        reciever = getUserByUsername(username2);
      } else if (user.username === username2) {
        reciever = getUserByUsername(username1);
      } else console.log("Error");

      const recieverSocket = io.sockets.sockets.get(reciever.id);

      if (reciever.room !== user.room)
        recieverSocket.emit("sendMessageNotification", user.id);
    }
    //io.to(user.room).emit("message", messageObject(user.username, message));
    socket.emit("message", messageObject("You", message));
    socket.broadcast
      .to(user.room)
      .emit("message", messageObject(user.username, message));
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

server.listen(3000, () => console.log("Server listening on Port 3000"));
