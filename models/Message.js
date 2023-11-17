const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema({
  fromUser: String,
  toUser: String,
  text: String,
  imageUrl: String,
  timestamp: String,
});

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;
