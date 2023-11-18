// Define User schema
const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  username: String,
  password: String,
  online: { type: Boolean, default: false },
  socketId: String,
});

const User = mongoose.model("User", userSchema);
module.exports = User;
