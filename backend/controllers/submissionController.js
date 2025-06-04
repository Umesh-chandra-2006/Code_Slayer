const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const User = require("../models/User");
const axios = require("axios");

const COMPILER_BACKEND_URL = process.env.COMPILER_BACKEND_URL;

const handleSubmission = async (req, res) => {
  const { userId, problemId, code, language } = req.body;

  if (!userId || !problemId || !code || !language) {
    return res
      .status(400)
      .json({ error: "Missing required fields for submission." });
  }

  const submission = new Submission({
    user: userId,
    problem: problemId,
    code,
    language,
    verdict: "Pending",
    submittedAt: new Date(),
    testResults: [], // Initialize as empty array
    errorMessage: null,
    runtime: null,
    memory: null,
  });

  let savedSubmission;
  try {
    savedSubmission = await submission.save();
  } catch (dbErr) {
    console.error("Error saving initial submission:", dbErr);
    return res
      .status(500)
      .json({ error: "Failed to create submission record." });
  }

  try {
    // Fetch problem details from the Main Backend's database
    const problem = await Problem.findById(problemId);
    if (!problem) {
      console.error(
        `Problem ${problemId} not found for submission ${savedSubmission._id}`
      );
      savedSubmission.verdict = "Error";
      savedSubmission.errorMessage =
        "Associated problem not found for judging.";
      await savedSubmission.save();
      return res
        .status(404)
        .json({ success: false, error: "Problem not found for submission." });
    }

    // Prepare the problemDetails object to send to the Compiler Backend
    const problemDetailsToSend = {
      _id: problem._id,
      testCases: problem.testCases, // CRITICAL: Send the actual test cases
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
      // Add any other problem-specific details here that the compiler_backend might need
    };

    // Make an HTTP POST request to the Compiler Backend's /judge endpoint
    const judgeResponse = await axios.post(`${COMPILER_BACKEND_URL}/judge`, {
      code: code,
      language: language,
      problemDetails: problemDetailsToSend,
      isSubmission: true, // This flag tells the compiler backend to hide input/expected output in its results (by sending empty strings)
    });

    // --- CORRECTED DESTRUCTURING HERE ---
    // Changed 'finalVerdict' to 'overallVerdict' and 'detailedTestResults' to 'testResults'
    const {
      overallVerdict, // Corrected from finalVerdict
      compilationError,
      testResults: compilerTestResults, // Corrected from detailedTestResults, now named compilerTestResults for clarity in this file
      overallRuntime,
      overallMemory,
    } = judgeResponse.data;

    // Logging the raw response and the destructured values for debugging (can be removed after confirmation)
    console.log(
      "Main Backend: === RAW RESPONSE RECEIVED FROM COMPILER BACKEND ==="
    );
    console.log(judgeResponse.data);
    console.log("Main Backend: === END RAW RESPONSE ===");
    console.log("Main Backend: Destructured overallVerdict:", overallVerdict);
    console.log(
      "Main Backend: Destructured compilerTestResults (populated):",
      compilerTestResults
    );

    savedSubmission.verdict = overallVerdict; // Use overallVerdict
    savedSubmission.errorMessage = compilationError;

    // Map the compilerTestResults for database saving.
    // For DB, we still omit input/expectedOutput to keep records clean and consistent.
    savedSubmission.testResults = Array.isArray(compilerTestResults)
      ? compilerTestResults.map((tr) => ({
          status: tr.status,
          time: tr.time,
          memory: tr.memory,
          details: tr.details,
          label: tr.label,
          // input, expectedOutput, actualOutput are NOT stored in DB for submissions
        }))
      : [];

    savedSubmission.runtime = overallRuntime;
    savedSubmission.memory = overallMemory;

    await savedSubmission.save();

    // Update problem statistics in Main Backend's DB
    if (problem) {
      problem.totalSubmissions = (problem.totalSubmissions || 0) + 1;
      if (overallVerdict === "Accepted") {
        problem.solvedSubmissions = (problem.solvedSubmissions || 0) + 1;
      }
      await problem.save();
    }

    // Update user solved problems in Main Backend's DB
    const user = await User.findById(userId);
    if (user) {
      if (
        overallVerdict === "Accepted" &&
        !user.solvedProblems.includes(problemId)
      ) {
        user.solvedProblems.push(problemId);
      }
      await user.save();
    }

    let message = "Submission processed.";
    if (overallVerdict === "Accepted") {
      message = "Solution Accepted!";
    } else if (overallVerdict === "Compilation Error") {
      message = "Compilation Error: Your code failed to compile.";
      if (compilationError && typeof compilationError === "string") {
        message += ` Details: ${compilationError.split("\n")[0]}...`;
      }
    } else if (overallVerdict === "Wrong Answer") {
      message = "Wrong Answer on one or more test cases.";
    } else if (overallVerdict === "Time Limit Exceeded") {
      message = "Time Limit Exceeded on one or more test cases.";
    } else if (overallVerdict === "Runtime Error") {
      message = "Runtime Error on one or more test cases.";
    } else {
      message = `Submission failed: ${overallVerdict}`;
    }

    // --- CRITICAL CHANGE TO MATCH PRE-SEGREGATION PAYLOAD ---
    // Prepare the testResults array for the frontend.
    // For SUBMISSIONS, we NOW INCLUDE 'input' and 'expectedOutput' with empty strings,
    // to match the pre-segregation payload structure and resolve frontend display issues.
    const responseTestResultsForFrontend = Array.isArray(compilerTestResults) // Use compilerTestResults here
      ? compilerTestResults.map((tr) => ({
          status: tr.status,
          time: tr.time,
          memory: tr.memory,
          details: tr.details,
          label: tr.label,
          // These keys will now be included with empty string values for submissions
          input: tr.input || "",
          expectedOutput: tr.expectedOutput || "",
          actualOutput: tr.actualOutput || "",
        }))
      : [];

    // --- FINAL PAYLOAD CHECK BEFORE SENDING (Keep this for immediate confirmation) ---
    console.log("Main Backend: === FINAL PAYLOAD CHECK BEFORE SENDING ===");
    console.log(
      "Main Backend: Value of 'responseTestResultsForFrontend' at send point:",
      responseTestResultsForFrontend
    );
    console.log(
      "Main Backend: Type of 'responseTestResultsForFrontend':",
      typeof responseTestResultsForFrontend
    );
    console.log(
      "Main Backend: Is 'responseTestResultsForFrontend' an Array?:",
      Array.isArray(responseTestResultsForFrontend)
    );
    console.log(
      "Main Backend: Length of 'responseTestResultsForFrontend':",
      responseTestResultsForFrontend
        ? responseTestResultsForFrontend.length
        : "null/undefined"
    );
    console.log("Main Backend: === END FINAL PAYLOAD CHECK ===");
    // --- END FINAL PAYLOAD CHECK ---

    return res.status(200).json({
      success: true,
      message: message,
      verdict: overallVerdict, // Use overallVerdict
      submissionId: savedSubmission._id,
      compilationError: compilationError,
      testResults: responseTestResultsForFrontend, // Send this modified array
      overallRuntime: overallRuntime,
      overallMemory: overallMemory,
    });
  } catch (err) {
    console.error(
      "!!! CRITICAL MAIN BACKEND ERROR DETECTED IN handleSubmission CATCH BLOCK !!!"
    );
    console.error("Full Error Object:", err);
    console.error("Error Message:", err.message);
    if (axios.isAxiosError(err)) {
      console.error(
        "Is an Axios Error. Response status:",
        err.response?.status
      );
      console.error("Axios Error Response Data:", err.response?.data);
      console.error("Axios Error Request Config:", err.config);
    } else {
      console.error("Error Stack Trace:", err.stack);
    }
    if (savedSubmission) {
      savedSubmission.verdict = "Error";
      let detailedErrorMessage = "Unknown error during judging process.";
      let compilationErrorFromResponse = null;
      let receivedTestResultsForDB = []; // For DB saving (stripped)
      let responseTestResultsForFrontend = []; // For frontend response (structured correctly for error case)

      if (axios.isAxiosError(err) && err.response && err.response.data) {
        detailedErrorMessage =
          err.response.data.error ||
          err.response.data.message ||
          detailedErrorMessage;
        compilationErrorFromResponse =
          err.response.data.compilationError || null;

        if (Array.isArray(err.response.data.testResults)) {
          // Check err.response.data.testResults
          // For DB, strip input/expected/actual (even for errors)
          receivedTestResultsForDB = err.response.data.testResults.map(
            (tr) => ({
              status: tr.status,
              time: tr.time,
              memory: tr.memory,
              details: tr.details,
              label: tr.label,
            })
          );
          // For Frontend (error case), now include input/expected output as empty strings for consistency.
          responseTestResultsForFrontend = err.response.data.testResults.map(
            (tr) => ({
              status: tr.status,
              time: tr.time,
              memory: tr.memory,
              details: tr.details,
              label: tr.label,
              input: tr.input || "",
              expectedOutput: tr.expectedOutput || "",
              actualOutput: tr.actualOutput || "",
            })
          );
        }
      } else {
        detailedErrorMessage = err.message || detailedErrorMessage;
      }

      savedSubmission.errorMessage =
        compilationErrorFromResponse || detailedErrorMessage;
      savedSubmission.testResults = receivedTestResultsForDB;
      await savedSubmission.save();
    }

    res.status(500).json({
      success: false,
      error: "Submission Failed due to an unexpected server error.",
      verdict: "Error",
      compilationError: null,
      testResults: responseTestResultsForFrontend, // Send the formatted array to frontend on error too
      overallRuntime: null,
      overallMemory: null,
    });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("user", "username")
      .populate("problem", "title")
      .sort({ submittedAt: -1 });
    res.json({ success: true, submissions });
  } catch (err) {
    console.error("Error fetching all submissions:", err);
    res
      .status(500)
      .json({ success: false, error: "Error fetching Submissions" });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res
        .status(400)
        .json({ success: false, error: "User ID is required." });
    }
    const submissions = await Submission.find({ user: userId })
      .populate("user", "username")
      .populate("problem", "title")
      .sort({ submittedAt: -1 });
    return res.status(200).json({ success: true, submissions });
  } catch (err) {
    console.error("Error fetching user submissions:", err);
    return res
      .status(500)
      .json({ success: false, error: "Failed to load submission history." });
  }
};

module.exports = {
  handleSubmission,
  getAllSubmissions,
  getUserSubmissions,
};
