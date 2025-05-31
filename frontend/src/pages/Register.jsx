import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom"; // Import Link for navigation
import { motion } from "framer-motion"; // For animations
import { FaEye, FaEyeSlash } from "react-icons/fa";

export default function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
  });

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  const [verificationCode, setVerificationCode] = useState("");
  const [step, setStep] = useState(1);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const [isLoading, setIsLoading] = useState(false); // New loading state for API calls
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setConfirmShowPassword] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    if (cooldown > 0) {
      const timerId = setTimeout(() => setCooldown(cooldown - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [cooldown]);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const toggleConfirmPasswordVisibility = () => {
    setConfirmShowPassword(!showConfirmPassword);
  };

  const handleChanges = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    // Clear error message for the specific field if valid
    if (name === "password" || name === "confirm_password") {
      if (
        formData.password &&
        formData.confirm_password &&
        value === formData.password
      ) {
        setError("");
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true); // Start loading

    if (formData.password !== formData.confirm_password) {
      setError("Passwords do not match.");
      setIsLoading(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
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
        setMessage(
          data.message ||
            "Registration successful! Please check your email for a verification code."
        );
        setStep(2); // Move to verification step
        setCooldown(60); // Start cooldown for resend button
      } else {
        setError(data.message || "Registration failed.");
      }
    } catch (err) {
      console.error("Error during registration:", err);
      setError("Server error. Please try again later.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsLoading(true); // Start loading

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/verification`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email, code: verificationCode }),
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
        setVerificationCode("");
        setStep(1);
        setCooldown(0);
        setTimeout(() => navigate("/login"), 3000);
      } else {
        setError(data.message || "Email verification failed.");
      }
    } catch (err) {
      console.error("Error during verification:", err);
      setError("Server error during verification. Please try again later.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  const handlResend = async () => {
    setMessage("");
    setError("");
    setIsLoading(true); // Start loading

    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/resend-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message || "Verification code resent!");
        setCooldown(60); // Reset cooldown
      } else {
        setError(data.message || "Failed to resend code.");
      }
    } catch (err) {
      console.error("Error resending code:", err);
      setError("Server error when resending code. Please try again later.");
    } finally {
      setIsLoading(false); // End loading
    }
  };

  // Animation variants for framer-motion
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
            {step === 1 ? "Create Account" : "Verify Email"}
          </h2>
          <p className="text-gray-400 text-center">
            {step === 1
              ? "Join CodeJudge and start your coding journey!"
              : "A verification code has been sent to your email."}
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

        {step === 1 && (
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label
                htmlFor="username"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                Username:
              </label>
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleChanges}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Choose a username"
                required
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                Email:
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChanges}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="your@example.com"
                required
              />
            </div>

            <div className="relative">
              <label
                htmlFor="password"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                Password:
              </label>
              <input
                type={showPassword ? "text" : "password"}
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChanges}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Min 8 characters"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button" // Important: type="button" to prevent form submission
                onClick={togglePasswordVisibility}
                className="absolute inset-y-0 right-0 top-7 pr-3 flex items-center text-gray-400 hover:text-gray-200 focus:outline-none"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <FaEyeSlash size={18} /> : <FaEye size={18} />}
              </button>
            </div>

            <div className="relative">
              <label
                htmlFor="confirm_password"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                Confirm Password:
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirm_password"
                name="confirm_password" // Keep original name 'confirm_password' to track separately
                value={formData.confirm_password}
                onChange={handleChanges}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
                required
                minLength={8}
                autoComplete="new-password"
              />
              <button
                type="button" // Important: type="button" to prevent form submission
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
                  Registering...
                </div>
              ) : (
                "Register"
              )}
            </motion.button>
            <p className="text-center text-gray-400 text-sm mt-4">
              Already have an account?{" "}
              <Link to="/login" className="text-blue-400 hover:underline">
                Sign In
              </Link>
            </p>
          </form>
        )}

        {step === 2 && (
          <form onSubmit={handleVerify} className="space-y-5">
            <div>
              <label
                htmlFor="verification_code"
                className="block text-gray-300 text-sm font-semibold mb-2"
              >
                Verification Code:
              </label>
              <input
                type="text"
                id="verification_code"
                value={verificationCode}
                onChange={(e) => setVerificationCode(e.target.value)}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 text-center text-lg tracking-widest"
                placeholder="XXXXXX"
                required
                maxLength={6}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-4">
              <motion.button
                type="button"
                onClick={handlResend}
                disabled={cooldown > 0 || isLoading}
                whileHover={{ scale: cooldown > 0 ? 1 : 1.02 }}
                whileTap={{ scale: cooldown > 0 ? 1 : 0.98 }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
                  cooldown > 0 || isLoading
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gray-700 text-blue-300 hover:bg-gray-600 hover:text-blue-100"
                }`}
              >
                {isLoading && cooldown === 0 ? (
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
                    Resending...
                  </div>
                ) : cooldown > 0 ? (
                  `Resend Code (${cooldown}s)`
                ) : (
                  "Resend Code"
                )}
              </motion.button>
              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className={`flex-1 py-3 rounded-lg font-semibold transition-all duration-300 ${
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
                    Verifying...
                  </div>
                ) : (
                  "Verify"
                )}
              </motion.button>
            </div>
          </form>
        )}
      </motion.div>
    </div>
  );
}
