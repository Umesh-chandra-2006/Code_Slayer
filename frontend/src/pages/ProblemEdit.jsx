import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Card from "../components/UI/Card";
import Button from "../components/UI/Button";
import Badge from "../components/UI/Badge";
import axios from "axios";

export default function ProblemEdit() {
  const { id } = useParams(); // Get problem ID from URL
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
      // NEW: Replace sampleInput/sampleOutput with sampleTestCases array
    sampleTestCases: [{ input: "", output: "", explanation: "" }],
    constraints: "",
    difficulty: "Easy",
    testCases: [{ input: "", output: "", isPublic: false }],
    tags: [],
    // NEW: Problem properties
    timeLimit: 1000, // Default in milliseconds for UI
    memoryLimit: 256, // Default in MB
    editorial: "",
    hints: [""], // Array of strings, initially one empty hint
    starterCode: { cpp: "" }, // Object for starter code by language
    isPublished: false, // For controlling problem visibility
  });

  const [loadingProblem, setLoadingProblem] = useState(true); // Loading state for fetching problem data
  const [isSubmitting, setIsSubmitting] = useState(false); // Loading state for form submission
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({}); // To hold field-specific validation errors
  const [generalError, setGeneralError] = useState(""); // For non-validation errors or backend errors
  const token = localStorage.getItem("token");

  const [availableTags, setAvailableTags] = useState([]);
  const [newTagInput, setNewTagInput] = useState("");
  const [tagsLoading, setTagsLoading] = useState(true);
  const [tagsError, setTagsError] = useState(null);

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  // --- Fetch Available Tags ---
  const fetchAvailableTags = useCallback(async () => {
    try {
      setTagsLoading(true);
      setTagsError(null);
      const response = await axios.get(`${API_BASE_URL}/api/problems/tags`);
      const uniqueSortedTags = [...new Set(response.data)].sort();
      setAvailableTags(uniqueSortedTags);
    } catch (err) {
      console.error("Error fetching available tags:", err);
      setTagsError("Failed to load tags. Please ensure backend is running or has tags.");
    } finally {
      setTagsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAvailableTags();
  }, [fetchAvailableTags]);

  // --- Fetch Problem Data ---
  useEffect(() => {
    const fetchProblem = async () => {
      if (!id) {
        setGeneralError("Problem ID is missing.");
        setLoadingProblem(false);
        return;
      }
      if (!token) {
        setGeneralError("Authentication token not found. Please log in.");
        setLoadingProblem(false);
        return;
      }

      try {
        setLoadingProblem(true);
        const response = await axios.get(`${API_BASE_URL}/api/problems/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const problemData = response.data;

        // Map fetched data to form state, handling new fields and defaults
        setForm({
          title: problemData.title || "",
          description: problemData.description || "",
          inputFormat: problemData.inputFormat || "",
          outputFormat: problemData.outputFormat || "",
          // NEW: Ensure sampleTestCases is an array of objects
          sampleTestCases: problemData.sampleTestCases && problemData.sampleTestCases.length > 0
            ? problemData.sampleTestCases
            : [{ input: "", output: "", explanation: "" }], // Default if empty or null

          constraints: problemData.constraints || "",
          difficulty: problemData.difficulty || "Easy",
          testCases: problemData.testCases || [{ input: "", output: "", isPublic: false }],
          tags: problemData.tags || [],
          // NEW: Time and Memory limits (backend sends/expects milliseconds)
          timeLimit: problemData.timeLimit || 1000,
          memoryLimit: problemData.memoryLimit || 256,
          // NEW: Editorial, Hints, Starter Code
          editorial: problemData.editorial || "",
          hints: problemData.hints && problemData.hints.length > 0 ? problemData.hints : [""],
          starterCode: problemData.starterCode || { cpp: "" },
          isPublished: problemData.isPublished || false,
        });
        setGeneralError(""); // Clear any previous general errors
      } catch (err) {
        console.error("Error fetching problem:", err.response?.data || err);
        setGeneralError(err.response?.data?.message || err.message || "Failed to load problem data.");
      } finally {
        setLoadingProblem(false);
      }
    };

    fetchProblem();
  }, [id, token]); // Re-fetch if ID or token changes

  // --- General Change Handler ---
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    let newValue = value;

    if (type === "number") {
      newValue = Number(value);
    } else if (type === "checkbox") {
      newValue = checked;
    }

    setForm((prev) => ({
      ...prev,
      [name]: newValue,
    }));
    // Clear error for the field being changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // --- Test Cases Handlers (Hidden) ---
  const handleTestCaseChange = (idx, field, value) => {
    const newTestCases = [...form.testCases];
    newTestCases[idx][field] = value;
    setForm((prev) => ({ ...prev, testCases: newTestCases }));
    // Clear error if user starts typing (though we don't validate empty hidden test cases now)
    if (errors.testCases) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.testCases;
        return newErrors;
      });
    }
  };

  const addTestCase = () => {
    setForm((prev) => ({
      ...prev,
      testCases: [...prev.testCases, { input: "", output: "", isPublic: false }],
    }));
    if (errors.testCases) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.testCases;
        return newErrors;
      });
    }
  };

  const removeTestCase = (idx) => {
    setForm((prev) => ({
      ...prev,
      testCases: prev.testCases.filter((_, i) => i !== idx),
    }));
    if (errors.testCases) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.testCases;
        return newErrors;
      });
    }
  };

  // --- NEW: Sample Test Cases Handlers ---
  const handleSampleTestCaseChange = (idx, field, value) => {
    const newSampleTestCases = [...form.sampleTestCases];
    newSampleTestCases[idx][field] = value;
    setForm((prev) => ({ ...prev, sampleTestCases: newSampleTestCases }));
    if (errors.sampleTestCases) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.sampleTestCases;
        return newErrors;
      });
    }
  };

  const addSampleTestCase = () => {
    setForm((prev) => ({
      ...prev,
      sampleTestCases: [...prev.sampleTestCases, { input: "", output: "", explanation: "" }],
    }));
    if (errors.sampleTestCases) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.sampleTestCases;
        return newErrors;
      });
    }
  };

  const removeSampleTestCase = (idx) => {
    setForm((prev) => ({
      ...prev,
      sampleTestCases: prev.sampleTestCases.filter((_, i) => i !== idx),
    }));
    if (errors.sampleTestCases) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.sampleTestCases;
        return newErrors;
      });
    }
  };

  // --- NEW: Hints Handlers ---
  const handleHintChange = (idx, value) => {
    const newHints = [...form.hints];
    newHints[idx] = value;
    setForm((prev) => ({ ...prev, hints: newHints }));
    if (errors.hints) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.hints;
        return newErrors;
      });
    }
  };

  const addHint = () => {
    setForm((prev) => ({
      ...prev,
      hints: [...prev.hints, ""],
    }));
    if (errors.hints) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.hints;
        return newErrors;
      });
    }
  };

  const removeHint = (idx) => {
    setForm((prev) => ({
      ...prev,
      hints: prev.hints.filter((_, i) => i !== idx),
    }));
    if (errors.hints) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.hints;
        return newErrors;
      });
    }
  };

  // --- NEW: Starter Code Handler ---
  const handleStarterCodeChange = (language, value) => {
    setForm((prev) => ({
      ...prev,
      starterCode: {
        ...prev.starterCode,
        [language]: value,
      },
    }));
    if (errors[`starterCode.${language}`]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[`starterCode.${language}`];
        return newErrors;
      });
    }
  };


  // --- Tag Management Handlers ---
  const handleTagToggle = (tag) => {
    setForm((prev) => {
      const currentTags = prev.tags;
      if (currentTags.includes(tag)) {
        // If tag is already selected, remove it
        return { ...prev, tags: currentTags.filter((t) => t !== tag) };
      } else {
        // If tag is not selected, add it
        // Bug Fix: Clear tags error if a tag is added/removed
        if (errors.tags) {
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors.tags;
                return newErrors;
            });
        }
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };

  const handleAddTag = () => {
    const trimmedTag = newTagInput.trim();
    if (trimmedTag) {
      if (!availableTags.includes(trimmedTag)) {
        setAvailableTags((prev) => [...prev, trimmedTag].sort()); // Add to available and sort
      }
      if (!form.tags.includes(trimmedTag)) {
        setForm((prev) => ({ ...prev, tags: [...prev.tags, trimmedTag] })); // Select the new tag
        if (errors.tags) { // Bug Fix: Clear tags error if a tag is added
            setErrors(prevErrors => {
                const newErrors = { ...prevErrors };
                delete newErrors.tags;
                return newErrors;
            });
        }
      }
    }
    setNewTagInput("");
  };

  // --- Form Submission Handler ---
  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");
    setErrors({});
    setGeneralError("");
    setIsSubmitting(true);

    if (!token) {
      setGeneralError("Authentication token not found. Please log in.");
      setIsSubmitting(false);
      return;
    }

    const newErrors = {};

    // --- Validation Logic (Copied from NewProblem.jsx) ---
    if (!form.title.trim()) {
        newErrors.title = "Title is required.";
    }
    if (!form.description.trim()) {
        newErrors.description = "Description is required.";
    }
    // Validate Sample Test Cases
    if (form.sampleTestCases.length === 0) {
        newErrors.sampleTestCases = "At least one sample test case is required.";
    } else {
        const hasEmptySample = form.sampleTestCases.some(tc => tc.input.trim() === '' || tc.output.trim() === '');
        if (hasEmptySample) {
            newErrors.sampleTestCases = "All sample test cases must have input and output values.";
        }
    }
    // Validate Tags
    if (form.tags.length === 0) {
        newErrors.tags = "At least one tag must be selected.";
    }
    // Validate Editorial
    if (form.editorial.trim() === '') {
        newErrors.editorial = "Editorial is required.";
    }
    // Validate Starter Code
    if (form.starterCode.cpp.trim() === '') {
        newErrors['starterCode.cpp'] = "Starter code for C++ is required.";
    }

    if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setGeneralError("Please correct the highlighted errors before submitting.");
        setIsSubmitting(false);
        return;
    }

    // --- Confirmation Dialog (Copied from NewProblem.jsx) ---
    let confirmationMessage = "";
    if (form.isPublished) {
        confirmationMessage = "Are you sure you want to PUBLISH this problem immediately?";
    } else {
        confirmationMessage = "Are you sure you want to save these changes as a DRAFT?";
    }

    if (!window.confirm(confirmationMessage)) {
        setIsSubmitting(false);
        return; // User cancelled
    }

    try {
      const problemData = {
        ...form,
        // Send timeLimit directly in milliseconds as backend expects it
        timeLimit: Number(form.timeLimit),
        memoryLimit: Number(form.memoryLimit),
        // Filter out any empty hints before sending
        hints: form.hints.filter(hint => hint.trim() !== ''),
      };

      // CHANGE: Use axios.put for updating
      const res = await axios.put(`${API_BASE_URL}/api/problems/${id}`, problemData, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Problem updated successfully!");
      setGeneralError(""); // Clear any general errors on success
      // No form reset needed for edit page, but redirect after success
      setTimeout(() => navigate("/problems"), 1500);

    } catch (err) {
      console.error("Error updating problem:", err.response?.data || err);
      if (err.response && err.response.status === 400 && err.response.data.errors) {
        setErrors(err.response.data.errors);
        setGeneralError(err.response.data.message || "Please correct the highlighted errors.");
      } else {
        setGeneralError(err.response?.data?.message || err.message || "Failed to update problem.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const formVariants = {
    hidden: { opacity: 0, y: 50 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  if (loadingProblem) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-gray-100 flex items-center justify-center">
        <div className="text-xl flex items-center text-blue-400">
          <svg className="animate-spin h-6 w-6 mr-3 text-blue-400" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Loading problem...
        </div>
      </div>
    );
  }

  if (generalError && !loadingProblem) {
    return (
      <div className="min-h-screen bg-gray-900 p-8 text-gray-100 flex items-center justify-center">
        <Card className="bg-gray-800 border border-red-700 shadow-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400 mb-4">Error</h2>
          <p className="text-red-300 mb-6">{generalError}</p>
          <Button onClick={() => navigate("/problems")} variant="primary" className="px-6 py-3">
            Back to Problems
          </Button>
        </Card>
      </div>
    );
  }


  return (
    <div className="min-h-screen bg-gray-900 p-8 text-gray-100 flex items-center justify-center">
      <motion.div
        className="w-full max-w-4xl"
        initial="hidden"
        animate="visible"
        variants={formVariants}
      >
        <Card className="bg-gray-800 border border-gray-700 shadow-xl p-8">
          <h2 className="text-3xl font-extrabold text-white mb-6 text-center">
            Edit Problem
          </h2>

          {message && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-green-500/20 text-green-300 p-3 rounded-lg mb-4 text-center border border-green-500"
            >
              {message}
            </motion.p>
          )}
          {generalError && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-red-500/20 text-red-300 p-3 rounded-lg mb-4 text-center border border-red-500"
            >
              {generalError}
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
                className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.title ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              />
              {errors.title && <p className="text-red-400 text-sm mt-1">{errors.title}</p>}
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
                className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.description ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              ></textarea>
              {errors.description && <p className="text-red-400 text-sm mt-1">{errors.description}</p>}
            </div>

            {/* Tags selection UI */}
            <div>
              <label className="block text-gray-300 text-sm font-bold mb-2">
                Tags:
              </label>
              {tagsLoading ? (
                <p className="text-gray-400 text-sm p-3">Loading tags...</p>
              ) : tagsError ? (
                <p className="text-red-500 text-sm p-3 border border-red-500 rounded-lg">{tagsError}</p>
              ) : (
                <div className={`flex flex-wrap gap-2 p-3 bg-gray-700 rounded-lg border ${errors.tags ? 'border-red-500' : 'border-gray-600'}`}>
                  {availableTags.length === 0 ? (
                    <p className="text-gray-400 text-sm">No tags available. Add new tags below.</p>
                  ) : (
                    availableTags.map((tag) => (
                      <Badge
                        key={tag}
                        className={`cursor-pointer px-3 py-1 rounded-full text-sm ${
                          form.tags.includes(tag)
                            ? "bg-blue-600 text-white"
                            : "bg-gray-600 text-gray-300 hover:bg-gray-500"
                        }`}
                        onClick={() => handleTagToggle(tag)}
                      >
                        {tag}
                      </Badge>
                    ))
                  )}
                </div>
              )}
              <div className="mt-4 flex gap-2">
                <input
                  type="text"
                  placeholder="Create new tag..."
                  value={newTagInput}
                  onChange={(e) => setNewTagInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddTag();
                    }
                  }}
                  className="flex-1 px-4 py-2 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleAddTag}
                  className="bg-blue-700 hover:bg-blue-800 text-white px-4 py-2 rounded-lg"
                  disabled={!newTagInput.trim()}
                >
                  Add Tag
                </Button>
              </div>
              {errors.tags && <p className="text-red-400 text-sm mt-1">{errors.tags}</p>}
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
                  className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.inputFormat ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                ></textarea>
                {errors.inputFormat && <p className="text-red-400 text-sm mt-1">{errors.inputFormat}</p>}
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
                  className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.outputFormat ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                ></textarea>
                {errors.outputFormat && <p className="text-red-400 text-sm mt-1">{errors.outputFormat}</p>}
              </div>
            </div>

            {/* NEW: Sample Test Cases Section */}
            <div className={`border rounded-lg p-5 bg-gray-800/50 ${errors.sampleTestCases ? 'border-red-500' : 'border-gray-600'}`}>
                <h3 className="text-xl font-semibold text-white mb-4">Sample Test Cases (Public)</h3>
                {form.sampleTestCases.map((sample, idx) => (
                    <div key={`sample-${idx}`} className="flex flex-col gap-4 mb-4 p-4 border border-gray-700 rounded-lg bg-gray-700/50">
                        <div>
                            <label htmlFor={`sampleInput-${idx}`} className="block text-gray-400 text-sm font-medium mb-1">
                                Sample Input {idx + 1}:
                            </label>
                            <textarea
                                id={`sampleInput-${idx}`}
                                placeholder="Sample Test Case Input"
                                rows={2}
                                value={sample.input}
                                onChange={(e) => handleSampleTestCaseChange(idx, "input", e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor={`sampleOutput-${idx}`} className="block text-gray-400 text-sm font-medium mb-1">
                                Sample Expected Output {idx + 1}:
                            </label>
                            <textarea
                                id={`sampleOutput-${idx}`}
                                placeholder="Sample Expected Output"
                                rows={2}
                                value={sample.output}
                                onChange={(e) => handleSampleTestCaseChange(idx, "output", e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label htmlFor={`sampleExplanation-${idx}`} className="block text-gray-400 text-sm font-medium mb-1">
                                Explanation {idx + 1} (Optional):
                            </label>
                            <textarea
                                id={`sampleExplanation-${idx}`}
                                placeholder="Explanation for sample test case"
                                rows={2}
                                value={sample.explanation}
                                onChange={(e) => handleSampleTestCaseChange(idx, "explanation", e.target.value)}
                                className="w-full px-3 py-2 rounded-md bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            />
                        </div>
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeSampleTestCase(idx)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 mt-2"
                        >
                            Remove Sample
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={addSampleTestCase}
                    className="w-full py-2 border-dashed border-blue-500 text-blue-400 hover:bg-blue-900/20"
                >
                    Add Sample Test Case
                </Button>
                {errors.sampleTestCases && <p className="text-red-400 text-sm mt-2">{errors.sampleTestCases}</p>}
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
                className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.constraints ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
              ></textarea>
              {errors.constraints && <p className="text-red-400 text-sm mt-1">{errors.constraints}</p>}
            </div>

            {/* NEW: Time and Memory Limits */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label htmlFor="timeLimit" className="block text-gray-300 text-sm font-semibold mb-2">
                        Time Limit (milliseconds):
                    </label>
                    <input
                        type="number"
                        id="timeLimit"
                        name="timeLimit"
                        value={form.timeLimit}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.timeLimit ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        min="1"
                        step="1"
                        required
                    />
                    {errors.timeLimit && <p className="text-red-400 text-sm mt-1">{errors.timeLimit}</p>}
                </div>
                <div>
                    <label htmlFor="memoryLimit" className="block text-gray-300 text-sm font-semibold mb-2">
                        Memory Limit (MB):
                    </label>
                    <input
                        type="number"
                        id="memoryLimit"
                        name="memoryLimit"
                        value={form.memoryLimit}
                        onChange={handleChange}
                        className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.memoryLimit ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                        min="1"
                        step="1"
                        required
                    />
                    {errors.memoryLimit && <p className="text-red-400 text-sm mt-1">{errors.memoryLimit}</p>}
                </div>
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
                className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.difficulty ? 'border-red-500' : 'border-gray-600'} text-white focus:outline-none focus:ring-2 focus:ring-blue-500`}
                required
              >
                <option value="Easy">Easy</option>
                <option value="Medium">Medium</option>
                <option value="Hard">Hard</option>
              </select>
              {errors.difficulty && <p className="text-red-400 text-sm mt-1">{errors.difficulty}</p>}
            </div>

            {/* NEW: Editorial Section */}
            <div>
                <label htmlFor="editorial" className="block text-gray-300 text-sm font-semibold mb-2">
                    Editorial:
                </label>
                <textarea
                    id="editorial"
                    name="editorial"
                    value={form.editorial}
                    onChange={handleChange}
                    rows="8"
                    placeholder="Provide a detailed editorial for the problem solution..."
                    className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors.editorial ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
                    required
                ></textarea>
                {errors.editorial && <p className="text-red-400 text-sm mt-1">{errors.editorial}</p>}
            </div>

            {/* NEW: Hints Section */}
            <div className={`border rounded-lg p-5 bg-gray-800/50 ${errors.hints ? 'border-red-500' : 'border-gray-600'}`}>
                <h3 className="text-xl font-semibold text-white mb-4">Hints (Optional)</h3>
                {form.hints.map((hint, idx) => (
                    <div key={`hint-${idx}`} className="flex gap-4 mb-4 items-center">
                        <textarea
                            id={`hint-${idx}`}
                            placeholder={`Hint ${idx + 1}`}
                            rows={2}
                            value={hint}
                            onChange={(e) => handleHintChange(idx, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-md bg-gray-600 border border-gray-500 text-white placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        />
                        <Button
                            type="button"
                            variant="destructive"
                            onClick={() => removeHint(idx)}
                            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2"
                        >
                            Remove
                        </Button>
                    </div>
                ))}
                <Button
                    type="button"
                    variant="outline"
                    onClick={addHint}
                    className="w-full py-2 border-dashed border-blue-500 text-blue-400 hover:bg-blue-900/20"
                >
                    Add Hint
                </Button>
                {errors.hints && <p className="text-red-400 text-sm mt-2">{errors.hints}</p>}
            </div>

            {/* NEW: Starter Code Section */}
            <div>
                <label htmlFor="starterCodeCpp" className="block text-gray-300 text-sm font-semibold mb-2">
                    Starter Code (C++):
                </label>
                <textarea
                    id="starterCodeCpp"
                    name="starterCodeCpp"
                    value={form.starterCode.cpp}
                    onChange={(e) => handleStarterCodeChange("cpp", e.target.value)}
                    rows="10"
                    placeholder="Provide starter code for C++ (e.g., function signature, boilerplate code)"
                    className={`w-full px-4 py-2 rounded-lg bg-gray-700 border ${errors['starterCode.cpp'] ? 'border-red-500' : 'border-gray-600'} text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm`}
                    required
                ></textarea>
                {errors['starterCode.cpp'] && <p className="text-red-400 text-sm mt-1">{errors['starterCode.cpp']}</p>}
            </div>

            {/* Test Cases Section */}
            <div className={`border rounded-lg p-5 bg-gray-800/50 ${errors.testCases ? 'border-red-500' : 'border-gray-600'}`}>
              <h3 className="text-xl font-semibold text-white mb-4">Hidden Test Cases (Private)</h3>
              {form.testCases.map((tc, idx) => (
                <div key={`hidden-${idx}`} className="flex flex-col md:flex-row gap-4 mb-4 p-4 border border-gray-700 rounded-lg bg-gray-700/50">
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
                      // Removed 'required' to allow empty hidden test cases
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
                      // Removed 'required' to allow empty hidden test cases
                    />
                  </div>
                  <div className="flex items-end justify-between md:justify-start gap-4 mt-2 md:mt-0">
                    <label htmlFor={`isPublic-${idx}`} className="flex items-center text-gray-300 cursor-pointer">
                      <input
                        type="checkbox"
                        id={`isPublic-${idx}`}
                        checked={tc.isPublic}
                        onChange={(e) => handleTestCaseChange(idx, "isPublic", e.target.checked)}
                        className="form-checkbox h-4 w-4 text-blue-500 transition duration-150 ease-in-out bg-gray-700 border-gray-500 rounded"
                      />
                      <span className="ml-2 text-sm">Make Public</span>
                    </label>
                    <Button
                      type="button"
                      variant="destructive"
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
                Add Hidden Test Case
              </Button>
              {errors.testCases && <p className="text-red-400 text-sm mt-2">{errors.testCases}</p>}
            </div>

            {/* NEW: Is Published Checkbox */}
            <div className="flex items-center gap-2">
                <input
                    type="checkbox"
                    id="isPublished"
                    name="isPublished"
                    checked={form.isPublished}
                    onChange={handleChange}
                    className="form-checkbox h-5 w-5 text-purple-600 transition duration-150 ease-in-out bg-gray-700 border-gray-500 rounded"
                />
                <label htmlFor="isPublished" className="text-gray-300 text-base font-semibold cursor-pointer">
                    Publish Problem Immediately
                </label>
                <p className="text-gray-400 text-sm ml-4">(Unchecked means it will remain a draft)</p>
            </div>
            {errors.isPublished && <p className="text-red-400 text-sm mt-1">{errors.isPublished}</p>}


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