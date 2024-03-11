const chatForm = document.getElementById("form");
const input = document.getElementById("message-input");
const list = document.getElementById("users");
const messageContainer = document.getElementById("message-container");
const global = document.getElementById("global");
const frontUsername = document.getElementById("username");
const join = document.getElementById("join");

const socket = io();
const room = "Global";
let username = sessionStorage.getItem("username");
if (!username) {
  username = generateUsername();
  sessionStorage.setItem("username", username);
}
if (username) frontUsername.innerHTML = `Username: ${username}`;

socket.on("restoreGlobalChat", (messages) => {
  messages.forEach((message) => {
    const object = {
      username: message.username,
      text: message.text,
    };
    putMessageInChat(object);
  });
});

socket.on("message", (message) => {
  putMessageInChat(message);

  messageContainer.scrollTop = messageContainer.scrollHeight;
});

socket.on("users", (users) => {
  const onlineUsers = users.filter((user) => user.id !== socket.id);
  updateList(onlineUsers);
});

socket.on("sendMessageNotification", (recieverSocketId) => {
  console.log("Socket primaoca: " + recieverSocketId);

  const span = document.getElementById(recieverSocketId);
  span.style.visibility = "visible";
});

// socket.on("privateRoomRequest", ({ senderId, privateRoom }) => {
//   const joinButton = document.createElement("button");
//   joinButton.innerHTML = "Join";
//   join.appendChild(joinButton);
//   joinButton.addEventListener("click", () => {
//     socket.emit("joinPrivateRoom", { senderId, privateRoom });
//   });
// });

// Sending global chat room on the beggining of the connection
socket.emit("joinRoom", { username, room });

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  if (input.value !== "") socket.emit("chatMessage", input.value);

  input.value = "";
  input.focus();
});

function putMessageInChat(message) {
  const div = document.createElement("div");
  div.classList.add("message");
  div.innerHTML = `<p class="user">${message.username}</p>
    <p class="text">${message.text}</p>`;
  messageContainer.appendChild(div);
}

function updateList(users) {
  list.innerHTML = "";

  users.forEach((user) => {
    let li = document.createElement("li");

    let span = document.createElement("span");
    span.setAttribute("id", user.id);
    span.style.visibility = "hidden";

    let a = document.createElement("a");
    a.setAttribute("id", user.username);
    let naziv = document.createTextNode(user.username);
    a.appendChild(naziv);
    a.title = user.id;
    a.href = "#";

    li.appendChild(a);
    li.appendChild(span);
    list.appendChild(li);

    a.addEventListener("click", () => {
      const username2 = a.text;

      let room = null;
      if (username > username2) room = username + "&" + username2;
      else room = username2 + "&" + username;

      //const otherUserId = a.title;

      const spanHide = document.getElementById(a.title);
      spanHide.style.visibility = "hidden";
      messageContainer.innerHTML = "";

      socket.emit("joinRoom", { username, room });
    });
  });
}

// socket.on("clearChat", (message) => {
//   messageContainer.innerHTML = "";
//   putMessageInChat(message);
// });

global.addEventListener("click", () => {
  console.log("mrmot");
  const room = "Global";
  messageContainer.innerHTML = "";
  socket.emit("joinRoom", { username, room });
});

function generateUsername() {
  const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
  let username = "";
  for (let i = 0; i < 8; i++) {
    username += characters.charAt(
      Math.floor(Math.random() * characters.length)
    );
  }
  return username;
}
