const chatForm = document.getElementById("form");
const input = document.getElementById("message-input");

const socket = io();

socket.on("message", (message) => {
  putMessageInChat(message);
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  socket.emit("chatMessage", input.value);

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
