import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [message, setMessage] = useState("");
  const [error, seterror] = useState("");

  const navigate = useNavigate();

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    seterror("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();


      if (res.ok) {
        setMessage(data.message || "Registration Successful");
        setFormData({ username: "", email: "", password: "" });

        setTimeout(() => navigate("/login"), 1500);

      } else {
        seterror(data.message || "Registration failed");
      }
    } catch (err) {
      seterror("Server error, Try again Later");
    }
  };

  return (
    <div>
      <h2>Register Form</h2>

      {message && <p style={{ color: "green" }}> {message}</p>}
      {error && <p style={{ color: "red" }}> {error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            value={formData.username}
            onChange={handleChanges}
            required
            minLength={3}
          />
        </label>
        <br />
        <label>
          Email:
          <input
            type="text"
            name="email"
            value={formData.email}
            onChange={handleChanges}
            required
          />
        </label>
        <br />

        <label>
          Password:
          <input
            type="text"
            name="password"
            value={formData.password}
            onChange={handleChanges}
            required
            minLength={8}
          />
        </label>
        <br />

        <button type="Submit">Register</button>
      </form>
    </div>
  );
}
