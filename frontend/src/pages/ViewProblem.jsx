import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // Import Link for navigation
import { motion } from "framer-motion"; // For animations
import CodeEditor from "./CodeEditor"; // Assuming CodeEditor is in the same directory or accessible
import Card from "../components/UI/Card"; // Assuming Card component is available
import Badge from "../components/UI/Badge"; // Assuming Badge component is available

export default function ViewProblem() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null); // Renamed setproblem to setProblem for consistency
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const loggedInUserId = localStorage.getItem("userId"); // Used for passing to CodeEditor

  useEffect(() => {
    const fetchProblem = async () => { // Renamed fetchProblems to fetchProblem for consistency
      try {
        setLoading(true);
        setError(null);
        const res = await fetch(`http://localhost:5000/api/problems/${id}`);
        if (!res.ok) {
          throw new Error("Failed to fetch problem. It might not exist.");
        }
        const data = await res.json();
        setProblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError(err.message || "Failed to load problem details. Please try again.");
        setProblem(null); // Ensure problem is null on error
      } finally {
        setLoading(false);
      }
    };

    fetchProblem();
  }, [id]);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        when: "beforeChildren",
        staggerChildren: 0.2,
        duration: 0.6,
        ease: "easeOut",
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        <svg className="animate-spin h-8 w-8 mr-3 text-blue-500" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
        Loading problem details...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400 p-4">
        <p className="text-lg text-center">{error}</p>
      </div>
    );
  }

  if (!problem) { // This case should ideally be covered by `error` state, but as a fallback
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400 p-4">
        <p className="text-lg text-center">Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <motion.div
        className="max-w-6xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Left Column: Problem Details */}
        <div className="lg:order-1 order-2">
          <Card className="bg-gray-800 border border-gray-700 shadow-xl p-6 mb-8">
            <motion.div variants={itemVariants}>
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-3xl font-extrabold text-white leading-tight">
                  {problem.title}
                </h2>
                <Badge
                  variant={
                    problem.difficulty === "Hard"
                      ? "danger"
                      : problem.difficulty === "Medium"
                      ? "warning"
                      : "success"
                  }
                  className="py-1 px-3 text-base rounded-full"
                >
                  {problem.difficulty}
                </Badge>
              </div>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Description:</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">{problem.description}</p>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Input Format:</h3>
              <pre className="bg-gray-700 p-3 rounded-lg text-gray-200 overflow-auto whitespace-pre-wrap">
                {problem.inputFormat || "Not specified."}
              </pre>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Output Format:</h3>
              <pre className="bg-gray-700 p-3 rounded-lg text-gray-200 overflow-auto whitespace-pre-wrap">
                {problem.outputFormat || "Not specified."}
              </pre>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Sample Input:</h3>
              <pre className="bg-gray-700 p-3 rounded-lg text-gray-200 overflow-auto whitespace-pre-wrap">
                {problem.sampleInput || "Not provided."}
              </pre>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Sample Output:</h3>
              <pre className="bg-gray-700 p-3 rounded-lg text-gray-200 overflow-auto whitespace-pre-wrap">
                {problem.sampleOutput || "Not provided."}
              </pre>
            </motion.div>

            <motion.div variants={itemVariants} className="mt-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Constraints:</h3>
              <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                {problem.constraints || "No specific constraints."}
              </p>
            </motion.div>
          </Card>
        </div>

        {/* Right Column: Code Editor */}
        <motion.div variants={itemVariants} className="lg:order-2 order-1">
          <Card className="bg-gray-800 border border-gray-700 shadow-xl p-6">
            <h3 className="text-2xl font-extrabold text-white mb-6 text-center">
              Submit Your Solution
            </h3>
            {/* CodeEditor component for user to write code */}
            <CodeEditor
              initialCode={`#include <iostream>\n\nint main() {\n    // Write your C++ code here\n    // Use std::cin for input and std::cout for output\n    \n    return 0;\n}`}
              initialInput={problem.sampleInput || ""} // Pre-fill with sample input if available
              problemId={id} // Pass problem ID to CodeEditor for submission
              userId={loggedInUserId} // Pass user ID
            />
          </Card>
        </motion.div>
      </motion.div>
    </div>
  );
}