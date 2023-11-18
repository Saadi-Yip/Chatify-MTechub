const Message = mongoose.model(
  "Message",
  new mongoose.Schema({
    sender: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
    },
    receiver: {
      user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
    },
    content: String,
    timestamp: { type: Date, default: Date.now },
    image: String, // Store image filename or URL
  })
);
