const { getAllUsers } = require("../../queries/users");

module.exports = async (req, res) => {
  const allUsers = await getAllUsers();
  console.log(allUsers);
  return res.json({ data: allUsers, totalUsers: allUsers?.length || 0 });
};
