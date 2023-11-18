// UserList.js
import React from "react";

function UserList({ users, onSelectUser, loggedInUser }) {
  // Filter out the logged-in user from the list
  const filteredUsers = users.filter(
    (user) => user.username !== loggedInUser?.username
  );

  return (
    <div className="user-list">
      <h2>Users</h2>
      <ul>
        {filteredUsers.map((user) => (
          <li key={user._id} onClick={() => onSelectUser(user)}>
            {user.username} - {user.online ? "Online" : "Offline"}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
