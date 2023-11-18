import React, { useState, useEffect } from "react";
import {
  BrowserRouter as Router,
  Route,
  Routes,
  Navigate,
} from "react-router-dom";
import axios from "axios";
import io from "socket.io-client";

import Login from "./Login";
import Signup from "./Signup";
import ChatScreen from "./ChatScreen";
import PrivateComponent from "./components/Auth/PrivateComponent";

const socket = io("https://chatify-mtechub-280a5c571a0b.herokuapp.com/");
console.log("socket connection...", socket);
function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if the user has a valid token
    const token = localStorage.getItem("token");
    if (token) {
      axios
        .get("https://chatify-mtechub-280a5c571a0b.herokuapp.com/users", {
          headers: {
            Authorization: token,
          },
        })
        .then((response) => {
          setUser(response.data);
        })
        .catch((error) => {
          console.error("Error fetching user data:", error);
        });
    }
  }, []);

  return (
    <Router>
      <Routes>
        {!user && <Route path="/" element={<Navigate to="/login" />} />}
        <Route
          path="/login"
          element=<Login setUser={setUser} socket={socket} />
        />

        <Route
          path="/signup"
          element=<Signup setUser={setUser} socket={socket} />
        />
        <Route element={<PrivateComponent />}>
          <Route
            path="/chat"
            element=<ChatScreen user={user} socket={socket} />
          />
        </Route>
      </Routes>
    </Router>
  );
}
export default App;
