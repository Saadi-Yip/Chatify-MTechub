const express = require("express");
const http = require("http");
const cloudinary = require("./middleware/Cloudinary.js");
const socketIO = require("socket.io");
const User = require("./models/User.js");
const Message = require("./models/Message.js");
const routes = require("./routes/index.js");
const uploadImage = require("./Controllers/uploadImage.js");
require("./db.js");
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: ["http://localhost:3000", "*"],
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  },
});
const PORT = process.env.PORT || 5000;

// Socket.IO logic
io.on("connection", (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on("disconnect", async () => {
    console.log(`User disconnected: ${socket.id}`);
    // Mark user as offline
    const user = await User.findOne({ socketId: socket.id });
    if (user) {
      user.online = false;
      await user.save();
      io.emit("update-user-status", { userId: user._id, online: false });
    }
  });

  // Set user socketId
  socket.on("set-socket-id", async (userId) => {
    const user = await User.findById(userId);
    if (user) {
      user.socketId = socket.id;
      await user.save();
      io.emit("update-user-status", { userId, online: true });
    }
  });

  // Handle chat messages
  const handleImageMessage = async (data) => {
    try {
      // Handle image upload and update the message data
      const image_upload = await cloudinary.uploader.upload(data.image?.path);
      data.image = image_upload.secure_url;

      // Save the message to the database
      const message = await Message.create(data);

      // Send the message to the sender
      io.to(socket.id).emit("receive-message", { message });

      // If the receiver is online, send the message to them as well
      if (data.receiver && data.receiver.online && data.receiver.socketId) {
        io.to(data.receiver.socketId).emit("receive-message", { message });
      }
    } catch (error) {
      console.error(error);
    }
  };

  socket.on(
    "send-message",
    async ({ content, receiverId, senderId, image }) => {
      try {
        const message = new Message({
          sender: senderId,
          receiver: receiverId,
          content,
          timestamp: new Date().toISOString(),
        });

        if (image) {
          handleImageMessage({ content, receiverId, senderId, image });
        } else {
          // Handle text messages
          await message.save();
          io.to(socket.id).emit("receive-message", { message });

          const receiver = await User.findById(receiverId);
          if (receiver && receiver.online && receiver.socketId) {
            io.to(receiver.socketId).emit("receive-message", { message });
          }
        }
      } catch (error) {
        console.error(error);
      }
    }
  );

  socket.on("image", async (data) => {
    handleImageMessage(data);
  });
});
app.post("/upload", upload.single("image"), async (req, res) => {
  uploadImage(req, res, io);
});
app.use(routes);
// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
