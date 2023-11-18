const express = require("express");
const http = require("http");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const socketIO = require("socket.io");
const multer = require("multer");
const path = require("path");
const cors = require("cors");
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

// Mongoose models
const User = mongoose.model(
  "User",
  new mongoose.Schema({
    username: String,
    password: String,
    online: { type: Boolean, default: false },
  })
);

const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    content: String,
    timestamp: { type: Date, default: Date.now },
    image: String, // Store image filename or URL
  })
);

// Middleware for parsing JSON
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  next();
});

let corsOptions = {
  origin: ["http://localhost:3000", "*"],
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  optionsSuccessStatus: 200,
  allowedHeaders: ["Content-Type", "Authorization"], // Add any other headers you need
};

app.use(cors(corsOptions));
app.use(express.json());
// Middleware for handling file uploads (images)
const storage = multer.diskStorage({
  destination: "./uploads",
  filename: function (req, file, cb) {
    cb(
      null,
      file.fieldname + "-" + Date.now() + path.extname(file.originalname)
    );
  },
});

const upload = multer({
  storage: storage,
}).single("image");

// User authentication
app.post("/signup", async (req, res) => {
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
});

app.post("/login", async (req, res) => {
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
});

// Middleware for user authentication
const authenticateUser = async (req, res, next) => {
  const token = req.headers.authorization;
  if (!token) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  try {
    const decodedToken = jwt.verify(token, "secret_key");
    req.userId = decodedToken.userId;

    // Check if the user is online
    const user = await User.findById(req.userId);
    if (!user || !user.online) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    next();
  } catch (error) {
    res.status(401).json({ error: "Unauthorized" });
  }
};

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
    console.log("set-socket-id", userId, socket);
    const user = await User.findById(userId);
    if (user) {
      user.socketId = socket.id;
      await user.save();
      io.emit("update-user-status", { userId, online: true });
    }
  });
  socket.on("send-message", async ({ content, receiverId, image }) => {
    try {
      const senderId = socket.userId;
      const sender = await User.findById(senderId);
      const receiver = await User.findById(receiverId);

      // Create a new message instance with the appropriate fields
      const message = new Message({
        sender: { user: senderId, name: sender.username },
        receiver: { user: receiverId, name: receiver.username },
        content,
        image,
        timestamp: new Date().toISOString(),
      });

      // Save the message to the database
      await message.save();

      // Send the message to the sender
      io.to(socket.id).emit("receive-message", { message });

      // If the receiver is online, send the message to them as well
      if (receiver && receiver.online && receiver.socketId) {
        io.to(receiver.socketId).emit("receive-message", { message });
      }
    } catch (error) {
      console.error(error);
    }
  });
});

// Image upload route
app.post("/upload", authenticateUser, (req, res) => {
  upload(req, res, (err) => {
    if (err) {
      return res.status(500).json({ error: "Error uploading file" });
    }
    res.json({ filename: req.file.filename });
  });
});

// Get all users for the logged-in user
app.get("/users", authenticateUser, async (req, res) => {
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
});

// Get messages between two users
app.get("/messages/:userId", authenticateUser, async (req, res) => {
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
});
// Get all messages for the logged-in user
app.get("/messages", authenticateUser, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [{ sender: req.userId }, { receiver: req.userId }],
    }).sort({ timestamp: 1 });

    res.json(messages);
  } catch (error) {
    res.status(500).json({ error: `Internal server error, ${error.message}` });
  }
});

// Start the server
server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
