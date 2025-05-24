import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const [verificationcode, setverificationcode] = useState("");
  const [step, setstep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, seterror] = useState("");
  const [cooldown, setcooldown] = useState(0);

  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timerId = setTimeout(() => setcooldown(cooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [cooldown]);

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    seterror("");

    if (formData.password !== formData.confirm_password) {
      seterror("passwords do not match");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          password: formData.password,
        }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Verification code send to Email");
        setstep(2);
        setcooldown(60);
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
        setFormData({
          username: "",
          email: "",
          password: "",
          confirm_password: "",
        });
        setverificationcode("");
        setstep(1);
        setcooldown(0);
        setTimeout(() => navigate("/login"), 1500);
      } else {
        seterror(data.message || "Verification failed");
      }
    } catch (err) {
      seterror("Server error, Try again Later");
    }
  };

  const handlResend = async () => {
    if (cooldown > 0) return;
    setMessage("");
    seterror("");

    try {
      const res = await fetch("http://localhost:5000/api/auth/resend-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });
      const data = await res.json();
      if (res.ok) {
        setMessage(data.message || "Verification code sent successfully");
        setcooldown(60);
      } else setMessage(data.message || "Failed to resend Verification Code");
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
              type="email"
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
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChanges}
              required
              minLength={8}
            />
          </label>
          <br />

          <label>
            Confirm Password:
            <input
              type="password"
              name="password"
              value={formData.confirm_password}
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
          <button type="button" onClick={handlResend} disabled={cooldown > 0}>
            {cooldown > 0 ? `Resend Code(${cooldown}s)` : "Resend Code"}
          </button>
          <button type="Submit">Verify</button>
        </form>
      )}
    </div>
  );
}
