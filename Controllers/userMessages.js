const User = require("../models/User.js");
const Message = require("../models/Message.js");

const userMessages = async (req, res) => {
  const { userId } = req.params;
  console.log(userId, req.userId);
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.userId, receiver: userId },
        { sender: userId, receiver: req.userId },
      ],
    }).sort({ timestamp: 1 });
    console.log(messages);
    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: `Internal server error, ${error.message}` });
  }
};

module.exports = userMessages;
