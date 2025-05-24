import React, {useState} from "react";
import { useParams, useNavigate } from "react-router-dom";

export default function ResetPassword() {
    const {token } = useParams();
    const navigate = useNavigate();

      const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e)=> {
    e.preventDefault();
    setMessage("");
    setError("");

    if(!password || !confirmPassword)
    {
        setError("Fill the details");
        return;
    }

    if(password !== confirmPassword)
    {
        setError("Passwords doesn't match");
        return ;
    }

    try {
        setLoading(true);

         const res = await fetch("http://localhost:5000/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data= await res.json();
      if (res.ok) {
        setMessage(data.message || "Password reset successful");
        setTimeout(() => navigate("/login"), 3000); 
      } else {
        setError(data.message || "Failed to reset password");
      }
    } catch(err) {
        setError("Server error");
    } finally {
        setLoading(false);
    }
  };
  return (
    <div className="Reset-Password">
        <h2>Reset Password</h2>
          {message && <p style={{ color: "green" }}>{message}</p>}
      {error && <p style={{ color: "red" }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <label>
          New Password:
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
        </label>
        <br />
        <label>
          Confirm New Password:
          <input
            type="password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
            minLength={6}
          />
        </label>
        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </button>
      </form>
    </div>
  )
}