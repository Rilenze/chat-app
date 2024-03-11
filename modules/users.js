const users = [];

// User joins the chat
function userJoin(id, username, room) {
  const user = { id, username, room };

  users.push(user);

  console.log(users);
  return user;
}

// User leaves the chat
function userLeaves(id) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    const user = users.splice(index, 1)[0];
    console.log(users);
    return user;
  }
}

function getOnlineUsers() {
  return users;
}

function getCurrentUser(id) {
  return users.find((user) => user.id === id);
}

function userChangeRoom(id, room) {
  const index = users.findIndex((user) => user.id === id);

  if (index !== -1) {
    users[index].room = room;
    console.log(users);
  }
}

function getUserByUsername(username) {
  return users.find((user) => user.username === username);
}

module.exports = {
  userJoin,
  userLeaves,
  getOnlineUsers,
  getCurrentUser,
  userChangeRoom,
  getUserByUsername,
};
