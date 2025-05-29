import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Card from "../components/UI/Card"; // Assuming you have a Card component
import Badge from "../components/UI/Badge"; // Assuming you have a Badge component

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        setLoading(true);
        setError(null);
        if (!userId) {
          setError("User not logged in.");
          setLoading(false);
          return;
        }

        const response = await fetch(`http://localhost:5000/api/submissions/user/${userId}`);
        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`);
        }
        const data = await response.json();
        setSubmissions(data);
      } catch (err) {
        console.error("Error fetching submissions:", err);
        setError("Failed to load submissions. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [userId]);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case "accepted":
        return "success";
      case "rejected":
        return "danger";
      case "pending":
        return "warning";
      case "error":
        return "info"; // Or another appropriate color for error
      default:
        return "default";
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8">
      <Card className="max-w-5xl mx-auto bg-gray-800 border border-gray-700 shadow-xl p-6 lg:p-8">
        <motion.h2
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl font-extrabold text-white mb-8 text-center"
        >
          Submission History
        </motion.h2>

        <AnimatePresence>
          {loading && (
            <motion.p
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg text-blue-400 py-8"
            >
              Loading submissions...
            </motion.p>
          )}

          {error && !loading && (
            <motion.p
              key="error"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg text-red-400 py-8"
            >
              {error}
            </motion.p>
          )}

          {!loading && !error && submissions.length === 0 && (
            <motion.p
              key="no-submissions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center text-lg text-gray-400 py-8"
            >
              No submissions found yet. Start solving problems!
            </motion.p>
          )}

          {!loading && !error && submissions.length > 0 && (
            <motion.div
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className="overflow-x-auto"
            >
              <table className="min-w-full bg-gray-700 rounded-lg shadow-lg overflow-hidden">
                <thead className="bg-gray-600 border-b border-gray-500">
                  <tr>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                      #
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                      Problem
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                      Language
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="py-3 px-4 text-left text-sm font-semibold text-gray-200 uppercase tracking-wider">
                      Submitted On
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-600">
                  {submissions.map((sub, index) => (
                    <motion.tr
                      key={sub._id}
                      variants={itemVariants}
                      whileHover={{ backgroundColor: "rgba(55, 65, 81, 0.5)" }} // gray-700 with opacity
                      className="bg-gray-700 transition-colors duration-200"
                    >
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {index + 1}
                      </td>
                      <td className="py-3 px-4 text-sm text-blue-300 hover:text-blue-200 transition-colors">
                        {/* Assuming problem title is clickable to view problem */}
                        <a href={`/problems/${sub.problem?._id}`}>
                          {sub.problem?.title || "Deleted Problem"}
                        </a>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-300">
                        {sub.language}
                      </td>
                      <td className="py-3 px-4 text-sm">
                        <Badge variant={getStatusBadgeVariant(sub.status)}>
                          {sub.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4 text-sm text-gray-400">
                        {new Date(sub.submittedAt).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </div>
  );
};

export default SubmissionHistory;