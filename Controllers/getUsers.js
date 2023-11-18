const User = require("../models/User.js");

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ _id: { $ne: req.userId } });
    res.json(
      users.map((user) => ({
        _id: user._id,
        username: user.username,
        online: user.online,
      }))
    );
  } catch (error) {
    res.status(500).json({ error: `Internal server error, ${error.message}` });
  }
};

module.exports = getUsers;
