// ChatScreen.js
import React, { useState, useEffect } from "react";
import UserList from "./UserList";
import Chat from "./Chat"; // Import your existing Chat component
import axios from "axios";
import LogoutButton from "./components/LogoutButton";

function ChatScreen({ socket }) {
  const [selectedUser, setSelectedUser] = useState(null);
  const [users, setUsers] = useState([]);
  const user = JSON.parse(localStorage.getItem("user"));
  useEffect(() => {
    // Fetch the list of users
    axios
      .get("https://chatify-mtechub-280a5c571a0b.herokuapp.com/users", {
        headers: {
          Authorization: localStorage.getItem("token"),
        },
      })
      .then((response) => {
        setUsers(response.data);
        // Emit set-socket-id event when the component initializes
        socket.emit("set-socket-id", user?.userId);
      })
      .catch((error) => {
        console.error("Error fetching users:", error);
      });
  }, []);

  const handleSelectUser = (selectedUser) => {
    setSelectedUser(selectedUser);
  };

  return (
    <div className="chat-screen">
      <div className="user-list">
        <UserList
          users={users}
          onSelectUser={handleSelectUser}
          loggedInUser={user}
        />
        <LogoutButton />
      </div>
      <div className="chat-window">
        <div className="chat-header">
          <h2>Welcome, {user?.username}!</h2>
        </div>
        <div className="chat-body">
          {selectedUser && (
            <Chat user={user} socket={socket} selectedUser={selectedUser} />
          )}
        </div>
      </div>
    </div>
  );
}

export default ChatScreen;
