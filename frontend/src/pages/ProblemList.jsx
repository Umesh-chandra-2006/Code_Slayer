import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion"; // For animations
// Assuming these UI components are available from Dashboard.jsx context
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge"; // Potentially useful for difficulty or status

export default function ProblemList() {
  const [problems, setProblems] = useState([]); // Renamed for consistency
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await fetch("http://localhost:5000/api/problems");
        if (!res.ok) {
          throw new Error("Failed to fetch problems");
        }
        const data = await res.json();
        setProblems(data);
      } catch (err) {
        console.error("Error fetching problems:", err);
        setError("Failed to load problems. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this problem?")) {
      return;
    }
    try {
      const res = await fetch(`http://localhost:5000/api/problems/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setProblems((prev) => prev.filter((problem) => problem._id !== id));
        alert("Problem deleted successfully!"); // Or use a notification system
      } else {
        const errorData = await res.json();
        alert(errorData.message || "Failed to delete problem.");
      }
    } catch (err) {
      console.error("Error deleting problem", err);
      alert("Error occurred while deleting problem.");
    }
  };

  // Animation variants for list items
  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-300">
        <svg
          className="animate-spin h-8 w-8 mr-3 text-blue-500"
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
        Loading problems...
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-4xl font-extrabold text-white mb-8 text-center">
          Problems List
        </h2>

        {problems.length === 0 ? (
          <div className="text-center text-gray-400 text-lg">
            No problems found. Check back later or create a new one!
          </div>
        ) : (
          <motion.div
            className="space-y-6"
            initial="hidden"
            animate="visible"
            transition={{ staggerChildren: 0.1 }}
          >
            {problems.map((problem) => (
              <motion.div key={problem._id} variants={itemVariants}>
                <Card className="bg-gray-800 border border-gray-700 shadow-xl hover:shadow-2xl transition-all duration-300">
                  <div className="flex justify-between items-start mb-3">
                    <Link
                      to={`/problems/${problem._id}`}
                      className="hover:text-blue-400 transition-colors"
                    >
                      <h3 className="text-2xl font-bold text-white leading-tight">
                        {problem.title}
                      </h3>
                    </Link>
                    <Badge
                      variant={problem.difficulty.toLowerCase()}
                      className="ml-4 py-1 px-3 text-sm rounded-full"
                    >
                      {problem.difficulty.charAt(0).toUpperCase() +
                        problem.difficulty.slice(1)}
                    </Badge>
                  </div>
                  <p className="text-gray-400 mb-4 line-clamp-2">
                    {problem.description}
                  </p>
                  <div className="flex justify-end space-x-3">
                    {isAdmin && (
                      <>
                        <Button
                          variant="secondary"
                          onClick={() => handleDelete(problem._id)}
                          className="bg-red-600 hover:bg-red-700 text-white"
                        >
                          Delete
                        </Button>
                        <Link to={`/problems/${problem._id}/edit`}>
                          <Button
                            variant="primary"
                            className="bg-orange-500 hover:bg-orange-600 text-white"
                          >
                            Edit
                          </Button>
                        </Link>
                      </>
                    )}
                  </div>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </div>
    </div>
  );
}
