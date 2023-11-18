import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom"; // Assuming you are using react-router-dom for navigation

function Login({ setUser, socket }) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    console.log("Login Function Called");
    axios
      .post("https://chatify-mtechub-280a5c571a0b.herokuapp.com/login", {
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
  };

  return (
    <div className="login-container">
      <div className="login-form">
        <h2>Login</h2>
        <form>
          <div className="form-group">
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="input-field"
              required
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
              required
            />
          </div>

          {error && <p className="error-message">{error}</p>}

          <button type="submit" className="submit-button" onClick={handleLogin}>
            Login
          </button>
        </form>

        <p className="signup-link">
          Don't have an account? <Link to="/signup">Sign up</Link>
        </p>
      </div>
    </div>
  );
}

export default Login;
