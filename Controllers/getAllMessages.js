const User = require("../models/User.js");
const Message = require("../models/Message.js");

const getAllMessages = async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: `Internal server error, ${error.message}` });
  }
};

module.exports = getAllMessages;
