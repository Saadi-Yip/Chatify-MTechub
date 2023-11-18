const User = require("../models/User.js");
const signup = async (req, res) => {
  const { username, password } = req.body;
  try {
    let previousUser = await User.findOne({ username: username });
    if (previousUser) {
      return res
        .status(401)
        .json({ message: "Please Try Different User Name!" });
    }
    const user = new User({ username, password });
    await user.save();
    res.status(201).json({ message: "User created successfully" });
  } catch (error) {
    res.status(500).json({ error: `Internal server error, ${error.message}` });
  }
};

module.exports = signup;
