const chatForm = document.getElementById("form");
const input = document.getElementById("message-input");
const list = document.getElementById("users");
const messageContainer = document.getElementById("message-container");

const socket = io();

socket.on("message", (message) => {
  putMessageInChat(message);

  messageContainer.scrollTop = messageContainer.scrollHeight;
});

socket.on("users", (users) => {
  updateList(users);
});

const room = "globalChat";
const username2 = "Niko";

socket.emit("joinRoom", { username2, room });

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
  const parent = document.getElementById("message-container");
  parent.appendChild(div);
}

function updateList(users) {
  list.innerHTML = `
    ${users.map((user) => `<li><a>${user.username}</a></li>`).join("")}
  `;
}
