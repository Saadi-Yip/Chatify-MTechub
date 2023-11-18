const User = require("../models/User.js");
const Message = require("../models/Message.js");
const cloudinary = require("../middleware/Cloudinary.js");
const jwt = require("jsonwebtoken");

const signup = require("./signup.js");
const login = require("./login.js");
const getUsers = require("./getUsers.js");
const getMessagesBetweenUsers = require("./userMessages.js");
const getAllMessages = require("./getAllMessages.js");

module.exports = {
  signup,
  login,
  getUsers,
  getMessagesBetweenUsers,
  getAllMessages,
};
