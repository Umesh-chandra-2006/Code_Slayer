import React, { useState } from "react";
import { Link } from "react-router-dom"; // Import Link for navigation
import { motion } from "framer-motion"; // For animations

export default function ForgotPassword() {
  const [email, setEmail] = useState(""); // Renamed for consistency
  const [message, setMessage] = useState(""); // Renamed for consistency
  const [error, setError] = useState(""); // Renamed for consistency
  const [isLoading, setIsLoading] = useState(false); // Renamed for consistency

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true); // Start loading

    try {
      const res = await fetch(
        `${API_BASE_URL}/api/auth/forgot-password`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        }
      );

      const data = await res.json();

      if (res.ok) {
        setMessage(
          data.message ||
            "Password reset link sent to your email. Please check your inbox."
        );
        setEmail(""); // Clear email after successful submission
      } else {
        setError(data.message || "Failed to send reset email. Please try again.");
      }
    } catch (err) {
      console.error("Error during forgot password request:", err);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Animation variants for framer-motion
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
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
            Forgot Password?
          </h2>
          <p className="text-gray-400 text-center">
            Enter your email to receive a password reset link.
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
          <div>
            <label htmlFor="email" className="block text-gray-300 text-sm font-semibold mb-2">
              Email:
            </label>
            <input
              type="email"
              id="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="your@example.com"
              required
              autoComplete="email"
            />
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
                <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Sending...
              </div>
            ) : (
              "Send Reset Link"
            )}
          </motion.button>
          <p className="text-center text-gray-400 text-sm mt-4">
            Remember your password?{" "}
            <Link to="/login" className="text-blue-400 hover:underline">
              Sign In
            </Link>
          </p>
        </form>
      </motion.div>
    </div>
  );
}