const chatForm = document.getElementById("form");
const input = document.getElementById("message-input");
const list = document.getElementById("users");
const messageContainer = document.getElementById("message-container");
const global = document.getElementById("global");

const socket = io();
const room = "Global";
let username = "Čeka";

socket.on("message", (message) => {
  putMessageInChat(message);

  messageContainer.scrollTop = messageContainer.scrollHeight;
});

socket.on("users", (users) => {
  updateList(users);
});

socket.on("username", (usr) => {
  username = usr;
});

// Sending global chat room on the beggining of the connection
socket.emit("joinRoom", room);

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
    a.title = user.username;
    a.href = "#";
    li.appendChild(a);
    list.appendChild(li);

    a.addEventListener("click", () => {
      const username2 = a.title;
      let privateRoom = "proba";

      if (username === username2) return;
      else if (username > username2) privateRoom = username + " & " + username2;
      else privateRoom = username2 + " & " + username;

      messageContainer.innerHTML = "";
      socket.emit("joinRoom", privateRoom);
    });
  });
}

global.addEventListener("click", () => {
  console.log("mrmot");
  socket.emit("joinRoom", "Global");
});
