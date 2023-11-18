const User = require("../models/User.js");
const jwt = require("jsonwebtoken");

const login = async (req, res) => {
  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    if (password !== user.password) {
      return res.status(401).json({
        error: `Invalid Password, ${password} sent and user has ${user}`,
      });
    }

    // Mark user as online
    user.online = true;
    await user.save();

    const token = jwt.sign({ userId: user._id }, "secret_key", {
      expiresIn: "1h",
    });
    res.status(200).json({ token, userId: user._id, username: user.username });
  } catch (error) {
    res.status(500).json({ error: `Internal server error, ${error.message}` });
  }
};

module.exports = login;
