const chatForm = document.getElementById("form");
const input = document.getElementById("message-input");

const socket = io();

socket.on("message", (message) => {
  console.log(message);
});

chatForm.addEventListener("submit", (e) => {
  e.preventDefault();

  socket.emit("chatMessage", input.value);
});
