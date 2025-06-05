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
      testCases: problem.testCases, 
      timeLimit: problem.timeLimit,
      memoryLimit: problem.memoryLimit,
    };

    const judgeResponse = await axios.post(`${COMPILER_BACKEND_URL}/judge`, {
      code: code,
      language: language,
      problemDetails: problemDetailsToSend,
      isSubmission: true, 
    });

    const {
      overallVerdict, 
      compilationError,
      testResults: compilerTestResults,
      overallRuntime,
      overallMemory,
    } = judgeResponse.data;

  

    savedSubmission.verdict = overallVerdict; 
    savedSubmission.errorMessage = compilationError;

    savedSubmission.testResults = Array.isArray(compilerTestResults)
      ? compilerTestResults.map((tr) => ({
          status: tr.status,
          time: tr.time,
          memory: tr.memory,
          details: tr.details,
          label: tr.label,
        }))
      : [];

    savedSubmission.runtime = overallRuntime;
    savedSubmission.memory = overallMemory;

    await savedSubmission.save();

    if (problem) {
      problem.totalSubmissions = (problem.totalSubmissions || 0) + 1;
      if (overallVerdict === "Accepted") {
        problem.solvedSubmissions = (problem.solvedSubmissions || 0) + 1;
      }
      await problem.save();
    }

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

   
    const responseTestResultsForFrontend = Array.isArray(compilerTestResults) 
      ? compilerTestResults.map((tr) => ({
          status: tr.status,
          time: tr.time,
          memory: tr.memory,
          details: tr.details,
          label: tr.label,
          input: tr.input || "",
          expectedOutput: tr.expectedOutput || "",
          actualOutput: tr.actualOutput || "",
        }))
      : [];

   


    return res.status(200).json({
      success: true,
      message: message,
      verdict: overallVerdict, 
      submissionId: savedSubmission._id,
      compilationError: compilationError,
      testResults: responseTestResultsForFrontend, 
      overallRuntime: overallRuntime,
      overallMemory: overallMemory,
    });
  } catch (err) {
    console.error("Error Message:", err.message);
    if (savedSubmission) {
      savedSubmission.verdict = "Error";
      let detailedErrorMessage = "Unknown error during judging process.";
      let compilationErrorFromResponse = null;
      let receivedTestResultsForDB = []; 
      let responseTestResultsForFrontend = []; 
      if (axios.isAxiosError(err) && err.response && err.response.data) {
        detailedErrorMessage =
          err.response.data.error ||
          err.response.data.message ||
          detailedErrorMessage;
        compilationErrorFromResponse =
          err.response.data.compilationError || null;

        if (Array.isArray(err.response.data.testResults)) {
          receivedTestResultsForDB = err.response.data.testResults.map(
            (tr) => ({
              status: tr.status,
              time: tr.time,
              memory: tr.memory,
              details: tr.details,
              label: tr.label,
            })
          );
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
      testResults: responseTestResultsForFrontend, 
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
