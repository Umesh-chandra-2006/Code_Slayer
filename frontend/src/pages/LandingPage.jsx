import React from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import HeroImage from "../assets/hero.svg"; // Ensure this image exists

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <>
      {/* Main Section */}
      <div className="min-h-screen bg-gradient-to-br from-blue-100 to-white dark:from-gray-900 dark:to-gray-800 flex flex-col-reverse md:flex-row items-center justify-center px-6 py-12 transition-colors duration-300">
        
        {/* Text Section */}
        <motion.div
          initial={{ opacity: 0, x: -50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 text-center md:text-left"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-blue-700 dark:text-blue-400 drop-shadow-sm mb-4">
            Welcome to <span className="text-blue-800 dark:text-blue-300">Online Judge</span>
          </h1>
          <p className="text-gray-700 dark:text-gray-300 text-base sm:text-lg max-w-xl leading-relaxed mb-8">
            Practice coding challenges, test your solutions, and become a better developer one problem at a time.
          </p>
          <div className="flex flex-col sm:flex-row justify-center md:justify-start gap-4">
            <button
              onClick={() => navigate("/register")}
              className="px-8 py-3 bg-blue-600 text-white font-medium rounded-lg shadow-md hover:bg-blue-700 transition"
            >
              Get Started
            </button>
            <button
              onClick={() => navigate("/login")}
              className="px-8 py-3 border border-blue-600 text-blue-600 font-medium rounded-lg hover:bg-blue-100 dark:hover:bg-gray-700 transition"
            >
              Login
            </button>
          </div>
        </motion.div>

        {/* Image Section */}
        <motion.div
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.8 }}
          className="md:w-1/2 mb-10 md:mb-0 flex justify-center"
        >
          <img src={HeroImage} alt="Hero" className="w-full max-w-md" />
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="w-full text-center py-4 border-t dark:border-gray-700 mt-10 text-sm text-gray-500 dark:text-gray-400 transition-colors duration-300">
        © {new Date().getFullYear()} Online Judge. All rights reserved.
      </footer>
    </>
  );
}
