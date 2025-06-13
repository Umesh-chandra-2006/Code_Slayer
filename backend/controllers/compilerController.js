const Problem = require("../models/Problem");
const axios = require("axios");

const COMPILER_BACKEND_URL = process.env.COMPILER_BACKEND_URL;
const runCppCode = async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body;

  if (!code) {
    return res.status(400).json({ success: false, error: "Code is required" });
  }

  try {
    const response = await axios.post(`${COMPILER_BACKEND_URL}/execute`, {
      language,
      code,
      input,
    });

    return res.status(response.status).json(response.data);
  } catch (err) {
    console.error("Error in runCppCode (Main Backend Proxy):", err.message);
    const status = err.response ? err.response.status : 500;
    const data = err.response
      ? err.response.data
      : {
          success: false,
          compilationError: null, 
          runtimeError: null,
          output: "",
          time: null,
          memory: null,
          error: "Internal Server Error during code execution.",
        };
    if (
      err.response &&
      err.response.data &&
      err.response.data.compilationError
    ) {
      data.compilationError = err.response.data.compilationError;
    }
    if (err.response && err.response.data && err.response.data.runtimeError) {
      data.runtimeError = err.response.data.runtimeError;
    }
    if (err.response && err.response.data && err.response.data.output) {
      data.output = err.response.data.output; 
    }
    if (err.response && err.response.data && err.response.data.time) {
      data.time = err.response.data.time;
    }
    if (err.response && err.response.data && err.response.data.memory) {
      data.memory = err.response.data.memory;
    }
    if (err.response && err.response.data && err.response.data.error) {
      data.error = err.response.data.error; 
    }
    return res.status(status).json(data);
  }
};

// Code execution for testing against problem's test cases (public tests)
const testAgainstAllCases = async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId) {
    return res.status(400).json({ success: false, error: "Missing Fields" });
  }

  try {
    // 1. Fetch problem details including test cases from main backend's DB
    const problem = await Problem.findOne( {slug : problemId});
    if (!problem) {
      return res
        .status(404)
        .json({ success: false, error: "Problem not found." });
    }

    // 2. Make an HTTP POST request to the Compiler Backend's /judge endpoint
    const response = await axios.post(`${COMPILER_BACKEND_URL}/judge`, {
      code: code,
      language: language,
      problemDetails: {
        _id: problem._id,
        testCases: problem.testCases,
        timeLimit: problem.timeLimit,
        memoryLimit: problem.memoryLimit,
      },
      isSubmission: false, 
    });

    // 3. Forward the Compiler Backend's response directly back to the frontend
    const { overallVerdict, compilationError, testResults } = response.data;
    return res.status(response.status).json({
      success: true,
      overallVerdict: overallVerdict,
      compilationError: compilationError,
      testResults: Array.isArray(testResults) ? testResults : [], 
    });
  } catch (err) {
    console.error(
      "Error in testAgainstAllCases (Main Backend Proxy):",
      err.message
    );
    const status = err.response ? err.response.status : 500;
    const data = err.response
      ? err.response.data
      : {
          success: false,
          compilationError: "Unknown error during testing.",
          testResults: [],
          overallVerdict: "Error",
        };
    if (
      err.response &&
      err.response.data &&
      err.response.data.compilationError
    ) {
      data.compilationError = err.response.data.compilationError;
    }
    if (err.response && err.response.data && err.response.data.testResults) {
      data.testResults = err.response.data.testResults;
    }
    if (err.response && err.response.data && err.response.data.overallVerdict) {
      data.overallVerdict = err.response.data.overallVerdict;
    }
    return res.status(status).json(data);
  }
};

module.exports = { runCppCode, testAgainstAllCases };
