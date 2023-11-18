// UserList.js
import React from "react";

function UserList({ users, onSelectUser, loggedInUser }) {
  return (
    <div className="user-list-container">
      <h3>User List</h3>
      <ul className="user-list">
        {users.map((user) => (
          <li
            key={user._id}
            className={user._id === loggedInUser.userId ? "current-user" : ""}
            onClick={() => onSelectUser(user)}
          >
            <span
              className={user._id === loggedInUser.userId ? "current-user" : ""}
            >
              {user.username}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default UserList;
