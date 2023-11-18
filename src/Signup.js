import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Signup({ setUser, socket }) {
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();
  const handleSignup = async (e) => {
    e.preventDefault();
    try {
      await axios
        .post("https://chatify-mtechub-280a5c571a0b.herokuapp.com/signup", {
          username,
          password,
        })
        .then((response) => {
          const { token, userId } = response.data;
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(response.data));
          setUser(response.data);
          console.log("...................", response.data);
          socket.emit("set-socket-id", userId); // Emit set-socket-id event
          navigate("/chat");
        })
        .catch((error) => {
          setError("Invalid username or password");
          console.error("Login error:", error);
        });

      // After successful signup, automatically log in the user
      const response = await axios.post(
        "https://chatify-mtechub-280a5c571a0b.herokuapp.com/login",
        {
          username,
          password,
        }
      );

      const { token, userId } = response.data;
      localStorage.setItem("token", token);
      setUser({ _id: userId, username });
    } catch (error) {
      console.error("Signup or Login error:", error);
    }
  };

  return (
    <div className="signup-container">
      <div className="signup-form">
        <h2>Sign Up</h2>
        <div className="form-group">
          <label htmlFor="username">Username:</label>
          <input
            type="text"
            id="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="input-field"
          />
        </div>
        <div className="form-group">
          <label htmlFor="password">Password:</label>
          <input
            type="password"
            id="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="input-field"
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button onClick={handleSignup} className="submit-button">
          Sign Up
        </button>
        <p className="signup-link">
          Already have account? <Link to="/login">Login</Link>
        </p>
      </div>
    </div>
  );
}

export default Signup;
