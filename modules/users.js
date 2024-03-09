const users = [];

// User joins the chat
function userJoin(id, username) {
  const user = { id, username };

  users.push(user);

  console.log(users);
  return user;
}

module.exports = {
  userJoin,
};
