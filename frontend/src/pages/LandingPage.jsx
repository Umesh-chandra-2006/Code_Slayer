import React from "react";
import { useNavigate } from "react-router-dom";

export default function Landing() {
  const navigate = useNavigate();

  return (
    <div style={{ textAlign: "center", marginTop: "100px" }}>
      <h1>Welcome to Online Judge</h1>
      <p>Your platform to practice coding challenges and improve your skills.</p>
      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate("/register")} style={{ marginRight: "10px" }}>
          Register
        </button>
        <button onClick={() => navigate("/login")}>Login</button>
      </div>
    </div>
  );
}
