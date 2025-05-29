import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion"; // For animations
import Card from "../components/UI/Card"; // Assuming Card component is available
import Button from "../components/UI/Button"; // Assuming Button component is available

export default function ProblemEdit() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({ // Renamed setform to setForm for consistency
    title: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    constraints: "",
    difficulty: "Easy",
    testCases: [{ input: "", output: "" }],
  });
  const [loading, setLoading] = useState(true); // Loading state for fetching problem data
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProblem = async () => { // Renamed fetchproblem to fetchProblem for consistency
      try {
        setLoading(true);
        setError("");
        const res = await fetch(`http://localhost:5000/api/problems/${id}`);
        if (res.ok) {
          const data = await res.json();
          setForm(data);
        } else {
          const errorData = await res.json();
          setError(errorData.message || "Failed to fetch problem details.");
        }
      } catch (err) {
        console.error("Error fetching problem:", err);
        setError("Server error while fetching problem.");
      } finally {
        setLoading(false);
      }
    };
    fetchProblem();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleTestCaseChange = (idx, field, value) => {
    const newTestCases = [...form.testCases];
    newTestCases[idx][field] = value;
    setForm((prev) => ({ ...prev, testCases: newTestCases }));
  };

  const addTestCase = () => {
    setForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "" }],
    }));
  };

  const removeTestCase = (idx) => {
    setForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== idx),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setError("");
    setIsSubmitting(true);

    try {
      const res = await fetch(`http://localhost:5000/api/problems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage("Problem updated successfully!");
        // Optionally redirect after a short delay
        setTimeout(() => navigate("/problems"), 1500);
      } else {
        const errorData = await res.json();
        setError(errorData.message || "Failed to update problem.");
      }
    } catch (err) {
      console.error("Error updating problem:", err);
      setError("Server error during update.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Animation variants for framer-motion
  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
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

  if (error && !form.title) { // Display error if problem data couldn't be loaded at all
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-red-400">
        <p>{error}</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 flex items-center justify-center">
      <motion.div
        className="w-full max-w-2xl"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <Card className="bg-gray-800 border border-gray-700 shadow-xl p-8">
          <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
            Edit Problem: {form.title}
          </h2>

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

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="title" className="block text-gray-300 text-sm font-semibold mb-2">
                Title:
              </label>
              <input
                type="text"
                id="title"
                name="title"
                value={form.title}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>

            <div>
              <label htmlFor="description" className="block text-gray-300 text-sm font-semibold mb-2">
                Description:
              </label>
              <textarea
                id="description"
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="5"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              ></textarea>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="inputFormat" className="block text-gray-300 text-sm font-semibold mb-2">
                  Input Format:
                </label>
                <textarea
                  id="inputFormat"
                  name="inputFormat"
                  value={form.inputFormat}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="outputFormat" className="block text-gray-300 text-sm font-semibold mb-2">
                  Output Format:
                </label>
                <textarea
                  id="outputFormat"
                  name="outputFormat"
                  value={form.outputFormat}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="sampleInput" className="block text-gray-300 text-sm font-semibold mb-2">
                  Sample Input:
                </label>
                <textarea
                  id="sampleInput"
                  name="sampleInput"
                  value={form.sampleInput}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
              <div>
                <label htmlFor="sampleOutput" className="block text-gray-300 text-sm font-semibold mb-2">
                  Sample Output:
                </label>
                <textarea
                  id="sampleOutput"
                  name="sampleOutput"
                  value={form.sampleOutput}
                  onChange={handleChange}
                  rows="3"
                  className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                ></textarea>
              </div>
            </div>

            <div>
              <label htmlFor="constraints" className="block text-gray-300 text-sm font-semibold mb-2">
                Constraints:
              </label>
              <textarea
                id="constraints"
                name="constraints"
                value={form.constraints}
                onChange={handleChange}
                rows="3"
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              ></textarea>
            </div>

            <div>
              <label htmlFor="difficulty" className="block text-gray-300 text-sm font-semibold mb-2">
                Difficulty:
              </label>
              <select
                id="difficulty"
                name="difficulty"
                value={form.difficulty}
                onChange={handleChange}
                className="w-full px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
            </div>

            {/* Test Cases Section */}
            <div className="border border-gray-600 rounded-lg p-5 bg-gray-800/50">
              <h3 className="text-xl font-semibold text-white mb-4">Test Cases</h3>
              {form.testCases.map((tc, idx) => (
                <div key={idx} className="flex flex-col md:flex-row gap-4 mb-4 p-4 border border-gray-700 rounded-lg bg-gray-700/50">
                  <div className="flex-1">
                    <label htmlFor={`input-${idx}`} className="block text-gray-400 text-sm font-medium mb-1">
                      Input {idx + 1}:
                    </label>
                    <textarea
                      id={`input-${idx}`}
                      placeholder="Test Case Input"
                      rows={2}
                      value={tc.input}
                      onChange={(e) => handleTestCaseChange(idx, "input", e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex-1">
                    <label htmlFor={`output-${idx}`} className="block text-gray-400 text-sm font-medium mb-1">
                      Expected Output {idx + 1}:
                    </label>
                    <textarea
                      id={`output-${idx}`}
                      placeholder="Expected Output"
                      rows={2}
                      value={tc.output}
                      onChange={(e) => handleTestCaseChange(idx, "output", e.target.value)}
                      className="w-full px-3 py-2 rounded-md bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                    />
                  </div>
                  <div className="flex items-end">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => removeTestCase(idx)}
                      className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                onClick={addTestCase}
                className="w-full py-2 border-dashed border-blue-500 text-blue-400 hover:bg-blue-900/20"
              >
                Add Test Case
              </Button>
            </div>

            <div className="flex justify-end gap-4 mt-8">
              <Button
                type="button"
                variant="secondary"
                onClick={() => navigate("/problems")}
                className="px-6 py-3"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                className={`px-6 py-3 ${
                  isSubmitting
                    ? "bg-gray-600 cursor-not-allowed"
                    : "bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg"
                }`}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center">
                    <svg className="animate-spin h-5 w-5 mr-3 text-white" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Updating...
                  </div>
                ) : (
                  "Update Problem"
                )}
              </Button>
            </div>
          </form>
        </Card>
      </motion.div>
    </div>
  );
}