import React, { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Button from "../components/UI/Button";
import axios from "axios";
import Editor from "@monaco-editor/react";
import ReactMarkdown from "react-markdown";

export default function CodeEditor({
    initialCode = "",
    initialInput = "",
    initialLanguage = "cpp",
    hideInputBox = false,
    userId = "",
    problemId = "",
    isControlledByParent = false,
    language: parentLanguage,
    setLanguage: setParentLanguage,
    publicTestCases = [],
    problemDescription = "",
}) {
    const [code, setCode] = useState(initialCode);
    const [input, setInput] = useState(initialInput);
    const [output, setOutput] = useState("");
    const [compilationError, setCompilationError] = useState("");
    const [runtimeError, setRuntimeError] = useState("");
    const [testResults, setTestResults] = useState([]);
    const [loadingRun, setLoadingRun] = useState(false);
    const [loadingSubmit, setLoadingSubmit] = useState(false);

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


    const editorRef = useRef(null); 

    const [initialProblemBoilerplateCode, setInitialProblemBoilerplateCode] = useState(initialCode); 

    const [internalLanguage, setInternalLanguage] = useState(initialLanguage);
    const currentLanguage = isControlledByParent ? parentLanguage : internalLanguage;
    const currentSetLanguage = isControlledByParent ? setParentLanguage : setInternalLanguage;

    const [submissionMessage, setSubmissionMessage] = useState("");
    const [currentTab, setCurrentTab] = useState("output");
    const [submissionVerdict, setSubmissionVerdict] = useState("");
    const [overallRunTime, setOverallRunTime] = useState(null); 
    const [overallMemory, setOverallMemory] = useState(null);    
    const [isRunVerdict, setIsRunVerdict] = useState(false);
    const [aiReviewContent, setAiReviewContent] = useState("");
    const [loadingAiReview, setLoadingAiReview] = useState(false);


    useEffect(() => {
        setCode(initialCode);
        setInput(initialInput);
        setInitialProblemBoilerplateCode(initialCode);
        if (!isControlledByParent) {
            setInternalLanguage(initialLanguage);
        }
    }, [initialCode, initialInput, initialLanguage, isControlledByParent]);

    useEffect(() => {
        if (problemId && publicTestCases.length > 0 && testResults.length === 0) {
            setCurrentTab("test_results");
        }
    }, [problemId, publicTestCases, testResults.length]);

    const clearResults = () => {
        setOutput("");
        setCompilationError("");
        setRuntimeError("");
        setTestResults([]);
        setSubmissionMessage("");
        setSubmissionVerdict("");
        setOverallRunTime(null);
        setOverallMemory(null);
        setIsRunVerdict(false);
        setAiReviewContent("");
    };
    const token = localStorage.getItem("token");

    const handleEditorDidMount = (editor, monaco) => {
        editorRef.current = editor;
        monaco.editor.defineTheme('dark-plus', {
            base: 'vs-dark',
            inherit: true,
            rules: [],
            colors: {
                'editor.background': '#111827',
            }
        });
        monaco.editor.setTheme('dark-plus'); 
    };

    const handleCodeChange = (value, event) => {
        setCode(value);
    };


    const handleLanguageChange = (e) => {
        const newLanguage = e.target.value;
        currentSetLanguage(newLanguage);
        clearResults();






    };


    const handleResetCode = () => {
        setCode(initialProblemBoilerplateCode);
        clearResults(); 
    };

    const handleRunOrTestCode = useCallback(async (e) => {
        e.preventDefault();
        clearResults();
        setLoadingRun(true);
        setIsRunVerdict(true); 

        const isProblemTestRun = problemId && !input.trim();
        setCurrentTab(isProblemTestRun ? "test_results" : "output");

        try {
            const headers = {};
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            let response;
            let data;

            if (isProblemTestRun) {

                response = await axios.post(`${API_BASE_URL}/api/compiler/test`, {
                    language: currentLanguage,
                    code,
                    problemId,
                }, { headers });
                data = response.data;

                setTestResults(data.testResults.map(tc => ({
                    ...tc,
                    isPublicRun: true
                })) || []);
                setOutput("");
                setCompilationError(data.compilationError || "");
                setRuntimeError(data.runtimeError || "");
                setOverallRunTime(data.overallRuntime || null); 
                setOverallMemory(data.overallMemory || null); 

                setSubmissionVerdict("");
            } else {

                response = await axios.post(`${API_BASE_URL}/api/compiler/run`, {
                    language: currentLanguage,
                    code,
                    input,
                }, { headers });
                data = response.data;

                setOutput(data.output || "");
                setCompilationError(data.compilationError || "");
                setRuntimeError(data.runtimeError || "");
                setTestResults([]);
                setOverallRunTime(data.time || null); 
                setOverallMemory(data.memory || null); 

                setSubmissionVerdict(""); 
            }
        } catch (err) {
            console.error("Error running/testing code:", err);
            const errorData = err.response?.data || {};
            setRuntimeError(errorData.runtimeError || errorData.error || "Server error during code execution or testing.");
            setCompilationError(errorData.compilationError || "");
            setSubmissionVerdict("Error"); 
            setTestResults([]);
            setOverallRunTime(null);
            setOverallMemory(null);
        } finally {
            setLoadingRun(false);
        }
    }, [code, currentLanguage, input, problemId, token]);

    const handleSubmitSolution = useCallback(async () => {
        clearResults();
        setLoadingSubmit(true);
        setSubmissionMessage("Submitting your solution...");
        setSubmissionVerdict("Pending");
        setCurrentTab("test_results");
        setIsRunVerdict(false); 

        if (!problemId || !userId) {
            setSubmissionMessage("Error: Problem ID or User ID is missing for submission.");
            setLoadingSubmit(false);
            setSubmissionVerdict("Error");
            return;
        }

        try {
            const headers = {
                "Content-Type": "application/json",
            };
            if (token) {
                headers.Authorization = `Bearer ${token}`;
            }

            const response = await axios.post(`${API_BASE_URL}/api/submissions`, {
                userId,
                problemId,
                code,
                language: currentLanguage,
            }, { headers });

            const data = response.data;
            setSubmissionMessage(data.message || "Solution submitted successfully!");
            setSubmissionVerdict(data.verdict || "Error");
            setCompilationError(data.compilationError || "");

            setTestResults(data.testResults.map(tc => ({
                ...tc,
                isSubmissionResult: true 
            })) || []);
            setOverallRunTime(data.overallRuntime || null);
            setOverallMemory(data.overallMemory || null);    

        } catch (err) {
            console.error("Error submitting solution:", err);
            const errorData = err.response?.data || {};
            setSubmissionMessage(errorData.error || errorData.message || "Server error during submission.");
            setSubmissionVerdict(errorData.verdict || "Error");
            setCompilationError(errorData.compilationError || "");
            setTestResults([]);
            setOverallRunTime(null);
            setOverallMemory(null);
        } finally {
            setLoadingSubmit(false);
        }
    }, [code, currentLanguage, problemId, userId, token]);
     
    const handleAiReview = useCallback(async () => {
     setLoadingAiReview(true);
     setAiReviewContent("Generating AI review...");
     setCurrentTab("aiReview");

     const token = localStorage.getItem("token");
     if (!token) {
         setAiReviewContent("Please log in to get AI review.");
         setLoadingAiReview(false);
         return;
     }

     try {
         const payload = {
             code: code,
             language: currentLanguage,
             problemDescription: problemDescription, 
             submissionVerdict: submissionVerdict,  
             compilationError: compilationError,
             runtimeError: runtimeError, 
             failedTestInput: submissionVerdict === "Wrong Answer" && testResults.length > 0
                 ? testResults.find(tr => tr.status === 'Wrong Answer')?.input 
                 : undefined,
         };

         const response = await axios.post(
             `${API_BASE_URL}/api/ai/review`, 
             payload,
             {
                 headers: {
                     Authorization: `Bearer ${token}`,
                     "Content-Type": "application/json",
                 },
             }
         );

         setAiReviewContent(response.data.review);
     } catch (error) {
         console.error("Error fetching AI review:", error);
         setAiReviewContent(
             `Failed to get AI review. ${error.response?.data?.message || error.message}`
         );
     } finally {
         setLoadingAiReview(false);
     }
 }, [code, currentLanguage, problemDescription, submissionVerdict, compilationError, runtimeError, testResults]); 

    const statusVariant = useCallback((status) => {
        switch (status) {
            case "Accepted":
            case "Passed":
                return "bg-green-500/20 text-green-400 border-green-600";
            case "Wrong Answer":
            case "Failed":
                return "bg-red-500/20 text-red-400 border-red-600";
            case "Time Limit Exceeded":
                return "bg-yellow-500/20 text-yellow-400 border-yellow-600";
            case "Runtime Error":
                return "bg-purple-500/20 text-purple-400 border-purple-600";
            case "Memory Limit Exceeded":
                return "bg-orange-500/20 text-orange-400 border-orange-600";
            case "Compilation Error":
                return "bg-red-500/20 text-red-400 border-red-600";
            case "Error":
                return "bg-gray-500/20 text-gray-400 border-gray-600";
            case "Pending":
                return "bg-blue-500/20 text-blue-400 border-blue-600";
            case "Completed": 
                return "bg-gray-500/20 text-gray-400 border-gray-600";
            default:
                return "bg-gray-500/20 text-gray-400 border-gray-600";
        }
    }, []);

    const resultVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };


    const monacoLanguageMap = {
        cpp: "cpp",
        python: "python",
        java: "java", 

    };

    return (
        <div className="flex flex-col h-full bg-gray-800 text-gray-100 rounded-lg shadow-lg">
            {!isControlledByParent && (
                <div className="p-4 border-b border-gray-700 flex justify-between items-center">
                    <label htmlFor="language-select" className="text-gray-300 mr-2">
                        Language:
                    </label>
                    <select
                        id="language-select"
                        value={currentLanguage}
                        onChange={handleLanguageChange}
                        className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="cpp">C++</option>
                        <option value="python">Python</option>
                    </select>
                </div>
            )}

            <div className="flex-1 p-4  flex flex-col"> 
                <label htmlFor="code-editor" className="block bg-gray-900 text-gray-300 text-sm font-semibold mb-2">
                    Code:
                </label>
                <div className="flex-grow relative"> 
                    <Editor
                        height="500px" 
                        language={monacoLanguageMap[currentLanguage] || "plaintext"}
                        value={code}
                        theme="dark-plus"
                        onMount={handleEditorDidMount}
                        onChange={handleCodeChange}
                        options={{
                            minimap: { enabled: false },
                            fontSize: 14,
                            scrollBeyondLastLine: false,
                            automaticLayout: true, 
                            wordWrap: "on",

                        }}
                    />
                </div>
            </div>

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

            <div className="p-4 border-t border-gray-700 flex flex-wrap gap-4 justify-end">
                {problemId && ( 
                    <Button
                        onClick={handleResetCode}
                        variant="secondary"
                        className="flex-1 md:flex-none min-w-[120px] bg-neutral-700 hover:bg-neutral-600 border border-neutral-600 text-white"
                    >
                        Reset Code
                    </Button>
                )}
                <Button
                    onClick={handleRunOrTestCode}
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
                {problemId && (
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
                )}
                {problemId && (
                <Button 
                    onClick={handleAiReview}
                    disabled={loadingAiReview || !submissionVerdict || submissionVerdict === "Pending"}
                    className={`flex-1 md:flex-none min-w-[120px] ${!submissionVerdict || submissionVerdict === "Pending" ? 'bg-gray-500' : 'bg-green-600 hover:bg-green-700'} text-white font-medium py-2 px-4 rounded-lg transition duration-200`}
                > 
                {loadingAiReview ? (
                        <div className="flex items-center justify-center">
                            <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            AI Reviewing...
                        </div>
                    ) : "AI Review"}
                </Button>
                )}
            </div>

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
                    <button
                        className={`px-4 py-2 text-sm font-medium ${currentTab === "aiReview" ? "border-b-2 border-blue-500 text-blue-400" : "text-gray-400 hover:text-gray-300"}`}
                        onClick={() => setCurrentTab("aiReview")}
                        disabled={!aiReviewContent && !loadingAiReview}
                    >
                        AI Review
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
                            {/* Only display overall verdict for submissions, not for run code */}
                            {!isRunVerdict && submissionVerdict && submissionVerdict !== "Pending" && (
                                <p className={`p-3 rounded-lg mb-4 text-sm font-bold ${statusVariant(submissionVerdict)}`}>
                                    Overall Verdict: {submissionVerdict}
                                </p>
                            )}
                            {/* Display overall runtime and memory for all runs/submissions if available */}
                            {(overallRunTime !== null || overallMemory !== null) && (
                                <div className="p-3 rounded-lg mb-4 text-sm bg-gray-700/50 text-gray-300 border border-gray-600 flex justify-between">
                                    {overallRunTime !== null && <span>Overall Time: {overallRunTime.toFixed(2)} ms</span>}
                                    {overallMemory !== null && <span>Overall Memory: {overallMemory} KB</span>}
                                </div>
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
                            {/* Only display overall verdict for submissions, not for run code */}
                            {!isRunVerdict && submissionVerdict && submissionVerdict !== "Pending" && (
                                <p className={`p-3 rounded-lg mb-4 text-sm font-bold ${statusVariant(submissionVerdict)}`}>
                                    Overall Verdict: {submissionVerdict}
                                </p>
                            )}
                            {/* Display overall runtime and memory for all runs/submissions if available */}
                            {(overallRunTime !== null || overallMemory !== null) && (
                                <div className="p-3 rounded-lg mb-4 text-sm bg-gray-700/50 text-gray-300 border border-gray-600 flex justify-between">
                                    {overallRunTime !== null && <span>Overall Time: {overallRunTime.toFixed(2)} ms</span>}
                                    {overallMemory !== null && <span>Overall Memory: {overallMemory} KB</span>}
                                </div>
                            )}

                            {/* Display public test cases initially or when no results are present AND it's not a submission result */}
                            {problemId && publicTestCases.length > 0 && testResults.length === 0 && !loadingRun && !loadingSubmit && (
                                <div className="space-y-4 mb-4">
                                    <h3 className="text-lg font-semibold text-gray-200">Public Test Cases:</h3>
                                    {publicTestCases.map((tc, index) => (
                                        <div key={`public-${index}`} className="p-4 rounded-lg border border-gray-700 bg-gray-900">
                                            <h4 className="font-semibold text-white mb-2">Test Case {index + 1} (Example):</h4>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                                                <div>
                                                    <p className="text-gray-300"><strong className="text-gray-200">Input:</strong> <pre className="inline-block bg-gray-700/50 p-1 rounded whitespace-pre-wrap">{tc.input}</pre></p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-300"><strong className="text-gray-200">Expected Output:</strong> <pre className="inline-block bg-gray-700/50 p-1 rounded whitespace-pre-wrap">{tc.expectedOutput}</pre></p>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <p className="text-gray-400 text-center py-2">Run your code to see results for these tests.</p>
                                </div>
                            )}

                            {testResults.length > 0 ? (
                                <div className="space-y-4">
                                    {testResults.map((result, index) => (
                                        <div
                                            key={index}
                                            className={`p-4 rounded-lg border ${statusVariant(result.verdict || result.status)}`}
                                        >
                                            {/* Fix "Test Case Test Case" typo */}
                                            <h4 className={`font-semibold mb-2 ${result.status === "Passed" || result.status === "Accepted" ? "text-green-400" : "text-red-400"}`}>
                                                {result.label || `Test Case ${index + 1}`}: {result.verdict || result.status}
                                            </h4>

                                            {/* Display input/output/expected only if it's a "Run" operation against public test cases */}
                                            {result.isPublicRun && (
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mt-2">
                                                    <div>
                                                        <p className="text-gray-300">
                                                            <strong className="text-gray-200">Time:</strong>{" "}
                                                            {result.time ? `${result.time.toFixed(2)} ms` : "N/A"}
                                                        </p>
                                                        <p className="text-gray-300">
                                                            <strong className="text-200">Memory:</strong>{" "}
                                                            {result.memory ? `${result.memory} KB` : "N/A"}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        {result.input && <p className="text-gray-300"><strong className="text-gray-200">Input:</strong> <pre className="inline-block bg-gray-700/50 p-1 rounded whitespace-pre-wrap">{result.input}</pre></p>}
                                                        {result.expectedOutput && <p className="text-gray-300"><strong className="text-gray-200">Expected:</strong> <pre className="inline-block bg-gray-700/50 p-1 rounded whitespace-pre-wrap">{result.expectedOutput}</pre></p>}
                                                        {result.actualOutput && <p className="text-gray-300"><strong className="text-gray-200">Your Output:</strong> <pre className="inline-block bg-gray-700/50 p-1 rounded whitespace-pre-wrap">{result.actualOutput}</pre></p>}
                                                    </div>
                                                </div>
                                            )}
                                            {/* Removed the block for displaying individual test case time/memory for submissions (isSubmissionResult) */}
                                            {result.details && (
                                                <p className="text-red-300 mt-2">
                                                    <strong className="text-red-200">Details:</strong> {result.details}
                                                </p>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                (!problemId || publicTestCases.length === 0) && (
                                    <p className="text-gray-400 text-center py-4">Test all cases to see results here.</p>
                                )
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

                    {currentTab === "aiReview" && (
                        <motion.div
                            key="ai-review-content"
                            variants={resultVariants}
                            initial="hidden"
                            animate="visible"
                            exit="exit"
                            className="mt-4 p-4 bg-gray-700/50 rounded-lg border border-gray-600 custom-scrollbar overflow-y-auto"
                            style={{ maxHeight: '400px' }} 

                        >
                            <h4 className="font-semibold mb-2 text-gray-200">AI Review:</h4>
                            {loadingAiReview ? (
                                <div className="flex items-center justify-center text-blue-400 py-4">
                                    <svg className="animate-spin h-6 w-6 mr-3" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    Generating AI insights...
                                </div>
                            ) : aiReviewContent ? (
                                <div className="prose prose-sm prose-invert max-w-none text-gray-300">
                                    <ReactMarkdown>{aiReviewContent}</ReactMarkdown>
                                </div>
                            ) : (
                                <p className="text-gray-400 text-center py-4">Click "AI Review" after a submission to get insights.</p>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}