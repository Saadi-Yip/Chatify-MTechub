// Chat.js
import React, { useState, useEffect } from "react";
import axios from "axios";

function Chat({ socket, selectedUser }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [image, setImage] = useState(null);
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    if (selectedUser) {
      // Fetch messages between the logged-in user and the selected user
      axios
        .get(
          `https://chatify-mtechub-280a5c571a0b.herokuapp.com/messages/${selectedUser._id}`,
          {
            headers: {
              Authorization: localStorage.getItem("token"),
            },
          }
        )
        .then((response) => {
          setMessages(response.data);
        })
        .catch((error) => {
          console.error("Error fetching messages:", error);
        });
    }
  }, [selectedUser]);

  useEffect(() => {
    if (selectedUser) {
      // Listen for incoming messages
      socket.on("receive-message", (data) => {
        console.log("Received", data);
        setMessages((prevMessages) => [...prevMessages, data.message]);
      });
      // Clean up the socket event listener when the component unmounts
      return () => {
        socket.off("receive-message");
      };
    }
  }, [socket, selectedUser]);

  const handleSendMessage = () => {
    if (content.trim() === "" && !image) {
      // Display an error message or disable the send button
      return;
    }
    socket.emit("send-message", {
      senderId: user?.userId,
      content,
      image,
      receiverId: selectedUser._id,
    });

    setContent("");
  };

  const handleSendImage = (e) => {
    e.preventDefault();
    if (!image) {
      return;
    }
    const formData = new FormData();
    const config = {
      headers: { "content-type": "multipart/form-data" },
    };

    formData.append("image", image);
    formData.append("senderId", user?.userId);
    formData.append("receiverId", selectedUser._id);
    axios
      .post(
        "https://chatify-mtechub-280a5c571a0b.herokuapp.com/upload",
        formData,
        config
      )
      .then((response) => {
        console.log(response);
      })
      .catch((error) => {
        console.log(error);
      })
      .finally(() => {
        setImage(null);
      });
  };

  return (
    <div className="chat-window">
      {selectedUser && (
        <div>
          <h2>Chat with {selectedUser?.username}</h2>
          <div className="messages">
            {messages?.map((message) => (
              <div
                key={message?._id}
                className={`message ${
                  message?.sender === user?.userId ? "sent" : "received"
                }`}
              >
                {message?.sender === user?.userId ? (
                  <>
                    <strong className="sender-name-you">You:</strong>{" "}
                    {message.image && <img src={message.image} alt="Sent" />}
                    {message.content}
                  </>
                ) : (
                  <>
                    <strong className="sender-name-other">
                      {selectedUser?.username}:
                    </strong>{" "}
                    {message.image && (
                      <img src={message.image} alt="Received" />
                    )}
                    {message?.content}
                  </>
                )}
              </div>
            ))}
          </div>{" "}
          <div className="input-area">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
            />
            <button onClick={handleSendMessage}>Send</button>
          </div>
          <input
            type="file"
            name="image"
            onChange={(e) => setImage(e.target.files[0])}
          />
          <button onClick={handleSendImage}>Send</button>
        </div>
      )}
    </div>
  );
}

export default Chat;
