import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setuser] = useState(null);

  useEffect(() => {
    const storeduser = localStorage.getItem("user");
    if (storeduser) setuser(JSON.parse(storeduser));

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found in localStorage!");
      return;
    }

  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Welcome to Dashboard</h2>
      {user && <p>Hello, {user.username}!</p>}

      <div style={{ marginTop: "20px" }}>
        <button onClick={() => navigate("/problems")}> Solve</button>
        <button
          onClick={() => navigate("/submissions")}
          style={{ marginLeft: "10px" }}
        >
          My submissions
        </button>
        <button onClick={handleLogout} style={{ marginLeft: "10px" }}>
          Logout
        </button>
      </div>
    </div>
  );
}
