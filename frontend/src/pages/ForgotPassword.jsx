import React, { useState } from "react";

export default function ForgotPassword() {
  const [email, setemail] = useState("");
  const [message, setmessage] = useState("");
  const [error, seterror] = useState("");
  const [loading, setloading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setmessage("");
    seterror("");
    setloading(true);

    try {
      const res = await fetch(
        "http://localhost:5000/api/auth/forgot-password",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setmessage(data.message || "Password reset code sent");
      } else seterror(data.message || "Failed to send code");
    } catch (err) {
      seterror("Server Error");
    }

    setloading(false);
  };

  return (
    <div>
      <h2>Forgot Password</h2>
      {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          Enter your registered email:
          <input
            type="email"
            value={email}
            onChange={(e) => setemail(e.target.value)}
            required
            disabled={loading}
          />
        </label>
        <br />
        <button type="Submit" disabled={loading}>
          {loading ? "Sending..." : "Send reset Link"}
        </button>
      </form>
    </div>
  );
}
