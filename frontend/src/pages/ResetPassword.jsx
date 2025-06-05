import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom"; 
import { motion } from "framer-motion"; 
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmShowPassword(!showConfirmPassword);
  };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");









    if (!password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters long.");
      return;
    }

    setIsLoading(true); 

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(
          data.message || "Password reset successful! Redirecting to login..."
        );
        setTimeout(() => navigate("/login"), 3000); 
      } else {
        setError(
          data.message ||
            "Failed to reset password. The link might be invalid or expired."
        );
      }
    } catch (err) {
      console.error("Error during password reset:", err);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false); 
    }
  };


  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, ease: "easeOut" },
    },
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-950 text-gray-100 p-4">
      <motion.div
        className="bg-gray-800/70 p-8 rounded-3xl shadow-2xl w-full max-w-md border border-gray-700"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg flex items-center justify-center shadow-lg mb-3">
            <span className="text-white font-extrabold text-xl">OJ</span>
          </div>
          <h2 className="text-4xl font-extrabold text-white mb-2">
            Reset Password
          </h2>
          <p className="text-gray-400 text-center">
            Set your new password for your account.
          </p>
        </div>

        {/* Message and Error Display */}
        {message && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-green-500/20 text-green-300 p-3 rounded-lg mb-4 text-center border border-green-500"
          >
            {message}
          </motion.p>
        )}
        {error && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center border border-red-500"
          >
            {error}
          </motion.p>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative">
            <label
              htmlFor="new-password"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              New Password:
            </label>
            <input
              type={showPassword ? "text" : "password"}
              id="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter new password (min 8 chars)"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button" 
              onClick={togglePasswordVisibility} 
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
            </button>
          </div>

          <div className="relative">
            <label
              htmlFor="confirm-password"
              className="block text-gray-300 text-sm font-semibold mb-2"
            >
              Confirm New Password:
            </label>
            <input
              type={showConfirmPassword ? "text" : "password"}
              id="confirm-password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm new password"
              required
              minLength={8}
              autoComplete="new-password"
            />
            <button
              type="button"
              onClick={toggleConfirmPasswordVisibility} 
              className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
              aria-label={
                showConfirmPassword ? "Hide password" : "Show password"
              }
            >
              {showConfirmPassword ? (
                <FaEyeSlash size={18} />
              ) : (
                <FaEye size={18} />
              )}
            </button>
          </div>

          <motion.button
            type="submit"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className={`w-full py-3 mt-6 rounded-lg font-semibold transition-all duration-300 ${
              isLoading
                ? "bg-gray-600 cursor-not-allowed"
                : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg"
            }`}
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <svg
                  className="animate-spin h-5 w-5 mr-3 text-white"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Resetting...
              </div>
            ) : (
              "Reset Password"
            )}
          </motion.button>
          <p className="text-center text-gray-400 text-sm mt-4">
            <Link to="/login" className="text-blue-400 hover:underline">
              Back to Login
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}