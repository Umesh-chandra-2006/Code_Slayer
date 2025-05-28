import React from "react";
import { useNavigate } from "react-router-dom";

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-white flex flex-col items-center justify-center px-4">
      <h1 className="text-5xl md:text-6xl font-extrabold mb-6 text-blue-700 drop-shadow-md">
        Welcome to Online Judge
      </h1>
      <p className="text-lg md:text-xl text-gray-700 mb-10 max-w-3xl text-center leading-relaxed">
        Solve coding problems, submit your solutions, and track your progress all in one place.
      </p>
      <div className="flex space-x-6">
        <button
          onClick={() => navigate("/register")}
          className="px-8 py-3 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 transition duration-300"
        >
          Register
        </button>
        <button
          onClick={() => navigate("/login")}
          className="px-8 py-3 border border-blue-600 text-blue-600 font-semibold rounded-lg hover:bg-blue-100 transition duration-300"
        >
          Login
        </button>
      </div>
    </div>
  );
}
