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

function getRoomUsers(room) {
  return users;
}

module.exports = {
  userJoin,
  userLeaves,
  getRoomUsers,
};
