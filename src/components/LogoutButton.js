import React from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      // Call the /logout endpoint to mark the user as offline
      await axios.post(
        "https://chatify-mtechub-280a5c571a0b.herokuapp.com/logout",
        {},
        {
          headers: {
            Authorization: localStorage.getItem("token"),
          },
        }
      );

      // Clear user data from local storage and navigate to the login page
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      navigate("/login");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <button onClick={handleLogout} className="button">
      Logout
    </button>
  );
}

export default LogoutButton;
