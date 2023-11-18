const User = require("../models/User.js");
const Message = require("../models/Message.js");
const cloudinary = require("../middleware/Cloudinary.js");
const jwt = require("jsonwebtoken");

const uploadImage = async (req, res, io) => {
  if (!req.file) {
    res.status(404).json({ message: "Image is Required!!" });
    return true;
  }

  try {
    let image_upload = await cloudinary.uploader.upload(req.file.path);

    let data = {
      image: image_upload && image_upload.secure_url,
      receiver: req.body.receiverId,
      sender: req.body.senderId,
      content: "",
      timestamp: new Date().toISOString(),
    };

    const sender = await User.findById(data.sender);
    const message = await Message.create(data);
    sender && io.to(sender.socketId).emit("receive-message", { message });

    const receiver = await User.findById(data.receiver);

    if (receiver && receiver.online && receiver.socketId) {
      io.to(receiver.socketId).emit("receive-message", { message });
    }

    res.status(200).send("Image uploaded successfully");
  } catch (err) {
    res.status(500).send(err.message);
  }
};

module.exports = uploadImage;
