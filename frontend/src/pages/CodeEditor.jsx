import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/UI/Button";

export default function CodeEditor({
  initialCode = "",
  initialInput = "",
  initialLanguage = "cpp",
  hideInputBox = false,
  userId = "",
  problemId = "",
}) {
  const [code, setCode] = useState(initialCode);
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState("");
  const [compilationError, setCompilationError] = useState("");
  const [runtimeError, setRuntimeError] = useState("");
  const [testResults, setTestResults] = useState([]); // Array for detailed test results
  const [loadingRun, setLoadingRun] = useState(false);
  const [loadingSubmit, setLoadingSubmit] = useState(false);
  const [language, setLanguage] = useState(initialLanguage);
  const [submissionMessage, setSubmissionMessage] = useState("");
  const [currentTab, setCurrentTab] = useState("output"); // 'output', 'test_results'
  const [submissionVerdict, setSubmissionVerdict] = useState(""); // New state for overall submission verdict

  useEffect(() => {
    setCode(initialCode);
    setInput(initialInput);
    setLanguage(initialLanguage);
  }, [initialCode, initialInput, initialLanguage]);

  const clearResults = () => {
    setOutput("");
    setCompilationError("");
    setRuntimeError("");
    setTestResults([]);
    setSubmissionMessage("");
    setSubmissionVerdict(""); // Clear verdict
  };
        const token = localStorage.getItem("token");


  // New combined function for "Run Code"
  const handleRunOrTestCode = async (e) => {
    e.preventDefault();
    clearResults();
    setLoadingRun(true);
    // Determine if we should run against test cases or custom input
    const shouldRunAgainstTestCases = problemId && !input.trim(); // Run against test cases if problemId exists and no custom input
    setCurrentTab(shouldRunAgainstTestCases ? "test_results" : "output"); // Set tab based on action

    try {
      let res;
      let data;

      if (shouldRunAgainstTestCases) {
        if (!problemId) {
          setCompilationError("Error: Problem ID is missing for testing.");
          setLoadingRun(false);
          return;
        }
        res = await fetch("http://localhost:5000/api/compiler/test", {
          method: "POST",
          headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
          body: JSON.stringify({ language, code, problemId }),
        });
        data = await res.json();
        if (res.ok) {
          setTestResults(data.testResults || []); // backend sends 'testResults'
          setCompilationError(data.compilationError || "");
          setSubmissionVerdict(data.overallVerdict || ""); // Store overall verdict from test endpoint
        } else {
          setCompilationError(data.compilationError || data.error || "Failed to test all cases.");
          setSubmissionVerdict("Error");
          setTestResults([]); // Clear results on error
        }
      } else {
        // Run with custom input or no input
        res = await fetch("http://localhost:5000/api/compiler/run", {
          method: "POST",
          headers: { "Content-Type": "application/json","Authorization": `Bearer ${token}` },
          body: JSON.stringify({ language, code, input }),
        });
        data = await res.json();
        if (res.ok) {
          setOutput(data.output || "");
          setCompilationError(data.compilationError || "");
          setRuntimeError(data.runtimeError || "");
          // Simple status for run for now, based on presence of errors
          setSubmissionVerdict(data.compilationError || data.runtimeError ? "Error" : "Completed");
        } else {
          setCompilationError(data.compilationError || data.error || "Execution failed.");
          setSubmissionVerdict("Error");
        }
      }
    } catch (err) {
      setRuntimeError("Server error during code execution or testing.");
      setSubmissionVerdict("Error");
      console.error("Error running/testing code:", err);
    } finally {
      setLoadingRun(false);
    }
  };

  const handleSubmitSolution = async () => {
    clearResults();
    setLoadingSubmit(true);
    setSubmissionMessage("");
    setSubmissionVerdict("Pending"); // Set to pending immediately on submit

    if (!problemId || !userId) {
      setSubmissionMessage("Error: Problem ID or User ID is missing for submission.");
      setLoadingSubmit(false);
      setSubmissionVerdict("Error");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ userId, problemId, code, language }),
      });

      const data = await res.json();
      if (res.ok) {
        setSubmissionMessage(data.message || "Solution submitted successfully!");
        setSubmissionVerdict(data.verdict || "Error"); // Use the verdict from backend
        setTestResults(data.testResults || []); // Display test results from submission
        setCompilationError(data.compilationError || "");
        setCurrentTab(data.testResults && data.testResults.length > 0 ? "test_results" : "output");
      } else {
        setSubmissionMessage(data.error || "Submission failed.");
        setSubmissionVerdict(data.verdict || "Error"); // Use the verdict from backend
        setCompilationError(data.compilationError || "");
        setTestResults([]);
      }
    } catch (err) {
      setSubmissionMessage("Server error during submission.");
      setSubmissionVerdict("Error");
      console.error("Error submitting solution:", err);
    } finally {
      setLoadingSubmit(false);
    }
  };

  // Maps backend verdict strings to Tailwind CSS classes
  const statusVariant = (status) => {
    switch (status) {
      case "Accepted":
        return "bg-green-500/20 text-green-400 border-green-600";
      case "Wrong Answer":
        return "bg-red-500/20 text-red-400 border-red-600";
      case "Time Limit Exceeded":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-600";
      case "Runtime Error":
        return "bg-purple-500/20 text-purple-400 border-purple-600";
      case "Compilation Error":
        return "bg-red-500/20 text-red-400 border-red-600";
      case "Error":
        return "bg-gray-500/20 text-gray-400 border-gray-600"; // General error
      case "Pending":
        return "bg-blue-500/20 text-blue-400 border-blue-600";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-600";
    }
  };

  const resultVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
  };

  return (
    <div className="flex flex-col h-full bg-gray-800 text-gray-100 rounded-lg shadow-lg">
      {/* Language Selector */}
      <div className="p-4 border-b border-gray-700 flex justify-between items-center">
        <label htmlFor="language-select" className="text-gray-300 mr-2">
          Language:
        </label>
        <select
          id="language-select"
          value={language}
          onChange={(e) => {
            setLanguage(e.target.value);
            clearResults();
          }}
          className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="cpp">C++</option>
          <option value="python">Python</option>
          {/* Add more languages as needed */}
        </select>
      </div>

      {/* Code Editor Area */}
      <div className="flex-1 p-4">
        <label htmlFor="code-editor" className="block text-gray-300 text-sm font-semibold mb-2">
          Code:
        </label>
        <textarea
          id="code-editor"
          className="w-full h-80 bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          placeholder={`// Write your ${language} code here\n// Use standard input (e.g., cin for C++, input() for Python) for problem input\n// Use standard output (e.g., cout for C++, print() for Python) for problem output`}
          required
        ></textarea>
      </div>

      {/* Custom Input Area (optional) */}
      {!hideInputBox && (
        <div className="p-4 border-t border-gray-700">
          <label htmlFor="custom-input" className="block text-gray-300 text-sm font-semibold mb-2">
            Custom Input (optional):
          </label>
          <textarea
            id="custom-input"
            className="w-full h-24 bg-gray-900 border border-gray-700 rounded-lg p-4 font-mono text-sm text-white resize-y focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all duration-200"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Provide input for the code if needed for 'Run Code'"
          ></textarea>
        </div>
      )}

      {/* Action Buttons */}
      <div className="p-4 border-t border-gray-700 flex flex-wrap gap-4 justify-end">
        <Button
          onClick={handleRunOrTestCode} // Combined function
          disabled={loadingRun || loadingSubmit}
          variant="secondary"
          className="flex-1 md:flex-none min-w-[120px]"
        >
          {loadingRun ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Running...
            </span>
          ) : (
            "Run Code"
          )}
        </Button>
        <Button
          onClick={handleSubmitSolution}
          disabled={loadingRun || loadingSubmit || !problemId || !userId}
          variant="primary"
          className="flex-1 md:flex-none min-w-[120px] bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600"
        >
          {loadingSubmit ? (
            <span className="flex items-center justify-center">
              <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Submitting...
            </span>
          ) : (
            "Submit Solution"
          )}
        </Button>
      </div>

      {/* Results Section */}
      <div className="p-4 border-t border-gray-700">
        <div className="flex border-b border-gray-700">
          <button
            onClick={() => setCurrentTab("output")}
            className={`py-2 px-4 text-sm font-medium ${
              currentTab === "output"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Output / Errors
          </button>
          <button
            onClick={() => setCurrentTab("test_results")}
            className={`py-2 px-4 text-sm font-medium ${
              currentTab === "test_results"
                ? "border-b-2 border-blue-500 text-blue-400"
                : "text-gray-400 hover:text-gray-300"
            }`}
          >
            Test Results
          </button>
        </div>

        <AnimatePresence mode="wait">
          {currentTab === "output" && (
            <motion.div
              key="output-tab"
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-4"
            >
              {submissionMessage && (
                <p className={`p-3 rounded-lg mb-4 text-sm ${
                  submissionMessage.includes("successfully") ? "bg-green-500/20 text-green-300 border border-green-500" : "bg-red-500/20 text-red-300 border border-red-500"
                }`}>
                  {submissionMessage}
                </p>
              )}
              {/* Display overall verdict for submission here */}
              {submissionVerdict && submissionVerdict !== "Pending" && (
                <p className={`p-3 rounded-lg mb-4 text-sm font-bold ${statusVariant(submissionVerdict)}`}>
                  Overall Verdict: {submissionVerdict}
                </p>
              )}
              {(output || compilationError || runtimeError) ? (
                <div className="bg-gray-900 p-4 rounded-lg border border-gray-700 min-h-[100px] overflow-auto">
                  {output && (
                    <>
                      <h4 className="text-green-400 font-semibold mb-2">Standard Output:</h4>
                      <pre className="text-sm text-gray-200 whitespace-pre-wrap">{output}</pre>
                    </>
                  )}
                  {compilationError && (
                    <>
                      <h4 className="text-red-400 font-semibold mb-2 mt-4">Compilation Error:</h4>
                      <pre className="text-sm text-red-300 whitespace-pre-wrap">{compilationError}</pre>
                    </>
                  )}
                  {runtimeError && (
                    <>
                      <h4 className="text-yellow-400 font-semibold mb-2 mt-4">Runtime Error:</h4>
                      <pre className="text-sm text-yellow-300 whitespace-pre-wrap">{runtimeError}</pre>
                    </>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Run your code to see output or errors here.</p>
              )}
            </motion.div>
          )}

          {currentTab === "test_results" && (
            <motion.div
              key="test-results-tab"
              variants={resultVariants}
              initial="hidden"
              animate="visible"
              exit="exit"
              className="mt-4"
            >
              {submissionVerdict && submissionVerdict !== "Pending" && (
                <p className={`p-3 rounded-lg mb-4 text-sm font-bold ${statusVariant(submissionVerdict)}`}>
                  Overall Verdict: {submissionVerdict}
                </p>
              )}
              {testResults.length > 0 ? (
                <div className="space-y-4">
                  {testResults.map((result, index) => (
                    <div
                      key={index}
                      className={`p-4 rounded-lg border ${statusVariant(result.status)}`}
                    >
                      <h4 className="font-semibold text-white mb-2">Test Case {index + 1}:</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-300">
                            <strong className="text-gray-200">Status:</strong>{" "}
                            <span className="capitalize">{result.status}</span>
                          </p>
                          {result.time && <p className="text-gray-300"><strong className="text-gray-200">Time:</strong> {result.time.toFixed(2)} ms</p>} {/* Display time with 2 decimal places */}
                          {result.memory && <p className="text-gray-300"><strong className="text-gray-200">Memory:</strong> {result.memory} KB</p>}
                        </div>
                        <div>
                          <p className="text-gray-300"><strong className="text-gray-200">Input:</strong> <pre className="inline-block bg-gray-700/50 p-1 rounded whitespace-pre-wrap">{result.input}</pre></p>
                          <p className="text-gray-300"><strong className="text-gray-200">Expected:</strong> <pre className="inline-block bg-gray-700/50 p-1 rounded whitespace-pre-wrap">{result.expectedOutput}</pre></p>
                          <p className="text-gray-300"><strong className="text-gray-200">Your Output:</strong> <pre className="inline-block bg-gray-700/50 p-1 rounded whitespace-pre-wrap">{result.actualOutput}</pre></p>
                        </div>
                      </div>
                      {result.details && ( // Use 'details' from backend
                        <p className="text-red-300 mt-2">
                          <strong className="text-red-200">Details:</strong> {result.details}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-400 text-center py-4">Test all cases to see results here.</p>
              )}
              {compilationError && (
                <motion.div
                  key="test-compilation-error"
                  variants={resultVariants}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  className="bg-red-500/20 text-red-300 p-3 rounded-lg mt-4 border border-red-500"
                >
                  <h4 className="font-semibold mb-2">Compilation Error:</h4>
                  <pre className="text-sm whitespace-pre-wrap">{compilationError}</pre>
                </motion.div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}