import React, { useEffect, useState, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';
import ReactMarkdown from 'react-markdown'; 

import CodeEditor from "./CodeEditor";
import Card from "../components/UI/Card";
import Badge from "../components/UI/Badge";

export default function ViewProblem() {
  const { id } = useParams();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("description"); 
  const [isAdmin, setIsAdmin] = useState(false);
  const [loggedInUserId, setLoggedInUserId] = useState(null); 
  const [selectedLanguage, setSelectedLanguage] = useState("cpp"); 
  
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;



  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        setIsAdmin(decodedToken.role === 'admin');
        setLoggedInUserId(decodedToken.id); 
      } catch (error) {
        console.error("Error decoding token:", error);
        setIsAdmin(false);
        setLoggedInUserId(null);
      }
    } else {
      setIsAdmin(false);
      setLoggedInUserId(null);
    }
  }, []);


  const fetchProblem = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token"); 
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const res = await axios.get(`${API_BASE_URL}/api/problems/${id}`, { headers });
      setProblem(res.data); 


      if (res.data.starterCode && res.data.starterCode.cpp) {
        setSelectedLanguage("cpp");
      } else if (res.data.starterCode && res.data.starterCode.python) {
        setSelectedLanguage("python");
      } else {
        setSelectedLanguage("cpp"); 
      }

    } catch (err) {
      console.error("Error fetching problem:", err);
      const errorMessage = err.response?.data?.message || err.message || "Failed to load problem details. It might not exist or you don't have permission.";
      setError(errorMessage);
      setProblem(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchProblem();
  }, [fetchProblem]);


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

  if (!problem) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-900 text-gray-400 p-4">
        <p className="text-lg text-center">Problem not found.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row min-h-screen bg-gray-900 text-gray-100">
      {/* Left Column: Problem Details */}
      <div className="flex-1 overflow-y-auto p-6 lg:border-r border-gray-700 custom-scrollbar">
        {/* Problem Title, Difficulty, and Edit Button */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-4 flex-wrap gap-2">
            <h2 className="text-3xl font-extrabold text-white leading-tight">
              {problem.problemNumber}. {problem.title}
            </h2>
            <div className="flex items-center gap-2">
              {isAdmin && (
                <Link
                  to={`/problems/${problem._id}/edit`}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors duration-200 text-sm"
                >
                  Edit Problem
                </Link>
              )}
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
              {problem.isPublished ? (
                <Badge className="bg-indigo-500 text-white py-1 px-3 text-base rounded-full">
                  Published
                </Badge>
              ) : (
                <Badge className="bg-gray-500 text-white py-1 px-3 text-base rounded-full">
                  Draft
                </Badge>
              )}
            </div>
          </div>
        </div>

        {/* Tags */}
        {problem.tags && problem.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2 mb-6">
            {problem.tags.map((tag, index) => (
              <Badge key={index} variant="info" className="px-3 py-1 text-sm rounded-full bg-blue-700">
                {tag}
              </Badge>
            ))}
          </div>
        )}

        {/* Language Selector (New) */}
        <div className="p-4 border-b border-t border-gray-700 flex justify-between items-center mb-6 rounded-t-lg">
          <label htmlFor="problem-language-select" className="text-gray-300 mr-2">
            Language:
          </label>
          <select
            id="problem-language-select"
            value={selectedLanguage}
            onChange={(e) => setSelectedLanguage(e.target.value)}
            className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            {/* Add more languages as needed */}
          </select>
        </div>


        {/* Tabs for Description, Editorial, Submissions, Comments */}
        <div className="mb-6 border-b border-gray-700">
          <nav className="-mb-px flex space-x-8" aria-label="Tabs">
            <button
              onClick={() => setActiveTab("description")}
              className={`${activeTab === "description"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Description
            </button>
            <button
              onClick={() => setActiveTab("editorial")}
              className={`${activeTab === "editorial"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
              disabled={!problem.editorial}
            >
              Editorial {problem.editorial ? '' : '(N/A)'}
            </button>
            <button
              onClick={() => setActiveTab("submissions")}
              className={`${activeTab === "submissions"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Submissions
            </button>
            {/* New Comments Tab */}
            <button
              onClick={() => setActiveTab("comments")}
              className={`${activeTab === "comments"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-300"
                } whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors duration-200`}
            >
              Comments / Forum
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === "description" && (
            <>
              <div className="my-6">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Description:</h3>
                {/* Apply prose classes to the container div */}
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                  <ReactMarkdown>
                    {problem.description}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="my-6">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Input Format:</h3>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed bg-gray-800 p-3 rounded-lg overflow-auto">
                  <ReactMarkdown>
                    {problem.inputFormat || "Not specified."}
                  </ReactMarkdown>
                </div>
              </div>

              <div className="my-6">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Output Format:</h3>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed bg-gray-800 p-3 rounded-lg overflow-auto">
                  <ReactMarkdown>
                    {problem.outputFormat || "Not specified."}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Multiple Sample Test Cases */}
              {problem.sampleTestCases && problem.sampleTestCases.length > 0 && (
                <div className="my-6">
                  <h3 className="text-xl font-semibold text-gray-200 mb-4">Sample Test Cases:</h3>
                  {problem.sampleTestCases.map((sample, index) => (
                    <div key={index} className="p-4 border border-gray-600 rounded-lg bg-gray-800 mb-4 last:mb-0">
                      <p className="font-medium text-gray-300 mb-2">Sample {index + 1}:</p>
                      <div className="mb-3">
                        <p className="font-medium text-gray-300 mb-1">Input:</p>
                        <pre className="bg-gray-700 p-3 rounded text-gray-100 overflow-auto whitespace-pre-wrap">
                          {sample.input || "Not provided."}
                        </pre>
                      </div>
                      <div className="mb-3">
                        <p className="font-medium text-gray-300 mb-1">Output:</p>
                        <pre className="bg-gray-700 p-3 rounded text-gray-100 overflow-auto whitespace-pre-wrap">
                          {sample.output || "Not provided."}
                        </pre>
                      </div>
                      {sample.explanation && (
                        <div>
                          <p className="font-medium text-gray-300 mb-1">Explanation:</p>
                          {/* Apply prose classes to the container div for explanation */}
                          <div className="prose prose-invert max-w-none text-gray-400">
                            <ReactMarkdown>
                              {sample.explanation}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="my-6">
                <h3 className="text-xl font-semibold text-gray-200 mb-2">Constraints:</h3>
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed">
                  <ReactMarkdown>
                    {problem.constraints || "No specific constraints."}
                  </ReactMarkdown>
                </div>
              </div>

              {/* Hints - Now part of description tab */}
              {problem.hints && problem.hints.length > 0 && (
                <div className="my-6">
                  <h3 className="text-xl font-semibold text-gray-200 mb-2">Hints:</h3>
                  <ul className="list-disc list-inside text-gray-300 pl-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                    {problem.hints.map((hint, index) => (
                      <li key={index} className="mb-2 last:mb-0 whitespace-pre-wrap">
                        {/* Apply prose classes to the container div for each hint */}
                        <div className="prose prose-invert inline-block">
                          <ReactMarkdown>{hint}</ReactMarkdown>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Stats: Acceptance Rate, Submissions, Time/Memory Limits - Now at the bottom of description */}
              <div className="my-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 bg-gray-800 p-4 rounded-lg border border-gray-700">
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Acceptance</p>
                  <p className="text-lg font-bold text-green-400">
                    {typeof problem.acceptanceRate === 'number' ? `${problem.acceptanceRate.toFixed(2)}%` : 'N/A'}
                  </p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Total Submissions</p>
                  <p className="text-lg font-bold text-white">{problem.totalSubmissions}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Solved Submissions</p>
                  <p className="text-lg font-bold text-white">{problem.solvedSubmissions}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Time Limit</p>
                  <p className="text-lg font-bold text-yellow-400">{problem.timeLimit / 1000} s</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-400 text-sm">Memory Limit</p>
                  <p className="text-lg font-bold text-yellow-400">{problem.memoryLimit} MB</p>
                </div>
              </div>
            </>
          )}

          {activeTab === "editorial" && (
            <div className="my-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Editorial:</h3>
              {problem.editorial ? (
                <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed bg-gray-800 p-4 rounded-lg border border-gray-700">
                  <ReactMarkdown>
                    {problem.editorial}
                  </ReactMarkdown>
                </div>
              ) : (
                <p className="text-gray-400">No editorial content available yet.</p>
              )}
            </div>
          )}

          {activeTab === "submissions" && (
            <div className="my-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Your Submissions:</h3>
              <div className="text-gray-400 leading-relaxed bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="mb-2">This section will display your past submissions for this problem.</p>
                <p className="text-sm italic"> (Implementation for fetching and displaying submissions will go here.)</p>
                {/* Placeholder for submission list if you have one */}
              </div>
            </div>
          )}

          {activeTab === "comments" && (
            <div className="my-6">
              <h3 className="text-xl font-semibold text-gray-200 mb-2">Comments / Forum:</h3>
              <div className="text-gray-400 leading-relaxed bg-gray-800 p-4 rounded-lg border border-gray-700">
                <p className="mb-2">Discussion forum for the problem.</p>
                <p className="text-sm italic"> (Coming soon/ Stay tuned.)</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Code Editor */}
      <div className="flex-1 p-6 custom-scrollbar">
        <Card className="bg-gray-800 border border-gray-700 shadow-xl p-6 h-full flex flex-col">
          <h3 className="text-2xl font-extrabold text-white mb-6 text-center">
            Submit Your Solution
          </h3>


          <div className="flex-1">
          <CodeEditor
            problemId={id}
            userId={loggedInUserId} 
            isControlledByParent={true}
            language={selectedLanguage}
            setLanguage={setSelectedLanguage}
            initialCode={problem.starterCode ? (problem.starterCode[selectedLanguage] || "") : ""} 
            publicTestCases={problem.sampleTestCases.map(tc => ({
              input: tc.input,
              expectedOutput: tc.output,


            }))}
            problemDescription={problem.description}
          />
          </div>
        </Card>
      </div>
    </div>
  );
}