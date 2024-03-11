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

socket.on("message", (message) => {
  putMessageInChat(message);

  messageContainer.scrollTop = messageContainer.scrollHeight;
});

socket.on("users", (users) => {
  const onlineUsers = users.filter((user) => user.id !== socket.id);
  updateList(onlineUsers);
});

socket.on("privateRoomRequest", ({ senderId, privateRoom }) => {
  const joinButton = document.createElement("button");
  joinButton.innerHTML = "Join";
  join.appendChild(joinButton);
  joinButton.addEventListener("click", () => {
    socket.emit("joinPrivateRoom", { senderId, privateRoom });
  });
});

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
    let a = document.createElement("a");
    a.setAttribute("id", user.username);
    let naziv = document.createTextNode(user.username);

    a.appendChild(naziv);
    a.title = user.id;
    a.href = "#";
    li.appendChild(a);
    list.appendChild(li);

    a.addEventListener("click", () => {
      alert(`You have sent request for private chat with ${a.text}`);
      console.log(a.text + " " + a.title);

      const username2 = a.text;

      // if (username === username2) return;
      // else if (username > username2) room = username + " & " + username2;
      // else room = username2 + " & " + username;

      const privateRoom = username + "-" + username2;
      const otherUserId = a.title;

      socket.emit("privateRoomClick", { otherUserId, privateRoom });
    });
  });
}

socket.on("clearChat", (message) => {
  messageContainer.innerHTML = "";
  putMessageInChat(message);
});

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
