import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [verificationcode, setverificationcode] = useState("");
  const [step, setstep] = useState(1);
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
        setMessage(data.message || "Verification code send to Email");
        setstep(2);
      } else {
        seterror(data.message || "Registration failed");
      }
    } catch (err) {
      seterror("Server error, Try again Later");
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    seterror("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: verificationcode }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Registration Successful");
        setFormData({ username: "", email: "", password: "" });

        setTimeout(() => navigate("/login"), 1500);
      } else {
        seterror(data.message || "Verification failed");
      }
    } catch (err) {
      seterror("Server error, Try again Later");
    }
  };

  const handlResend = async () => {
    setMessage("");
    seterror("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok)
        setMessage(data.message || "Verification code sent successfully");
      else setMessage(data.message || "Failed to resend Verification Code");
    } catch (err) {
      seterror("Server error, try again later");
    }
  };
  return (
    <div>
      <h2>Register Form</h2>

      {message && <p style={{ color: "green" }}> {message}</p>}
      {error && <p style={{ color: "red" }}> {error}</p>}
      {step === 1 && (
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
      )}

      {step === 2 && (
        <form onSubmit={handleVerify}>
          <label>
            Verification Code:
            <input
              type="text"
              value={verificationcode}
              onChange={(e) => setverificationcode(e.target.value)}
              required
              maxLength={6}
            />
          </label>
          <br />
          <button type="button" onClick={handlResend}>Resend Code</button>
          <button type="Submit">Verify</button>
        </form>
      )}
    </div>
  );
}
