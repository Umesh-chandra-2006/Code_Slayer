const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const { judgeCodeAgainstAllTestCases } = require("../utils/judgingEngine"); // IMPORT THE NEW UTILITY HERE

const handleSubmission = async (req, res) => {
  const { userId, problemId, code, language } = req.body;

  if (!userId || !problemId || !code || !language) {
    return res.status(400).json({ error: "Missing required fields for submission." });
  }

  // 1. Create initial submission in DB with "Pending" verdict
  const submission = new Submission({
    user: userId,
    problem: problemId,
    code,
    language,
    verdict: "Pending", // Set initial verdict
    submittedAt: new Date(),
    testResults: [], // Initialize empty
    errorMessage: null, // Initialize
    runtime: null, // Initialize
    memory: null, // Initialize
  });

  let savedSubmission;
  try {
    savedSubmission = await submission.save(); // Save to get an ID for later updates
  } catch (dbErr) {
    console.error("Error saving initial submission:", dbErr);
    return res.status(500).json({ error: "Failed to create submission record." });
  }

  try {
    // 2. Call the shared judging engine to get results
    const { finalVerdict, compilationError, detailedTestResults, overallRuntime, overallMemory } = await judgeCodeAgainstAllTestCases(code, language, problemId);

    // 3. Update the saved submission with the results
    savedSubmission.verdict = finalVerdict;
    savedSubmission.errorMessage = compilationError; // Use errorMessage for compilation errors
    savedSubmission.testResults = detailedTestResults;
    savedSubmission.runtime = overallRuntime; // Update overall runtime
    savedSubmission.memory = overallMemory; // Update overall memory

    await savedSubmission.save(); // Save the updated submission

    // 4. Send response to frontend
    let message = "Submission processed.";
    if (finalVerdict === "Accepted") {
      message = "Solution Accepted!";
    } else if (finalVerdict === "Compilation Error") {
      message = "Compilation Error: Your code failed to compile.";
      if (compilationError) message += ` Details: ${compilationError.split('\n')[0]}...`; // Shorten for message
    } else if (finalVerdict === "Wrong Answer") {
      message = "Wrong Answer on one or more test cases.";
    } else if (finalVerdict === "Time Limit Exceeded") {
      message = "Time Limit Exceeded on one or more test cases.";
    } else if (finalVerdict === "Runtime Error") {
      message = "Runtime Error on one or more test cases.";
    } else {
      message = `Submission failed: ${finalVerdict}`;
    }


    return res.status(200).json({
      message: message,
      verdict: finalVerdict,
      submissionId: savedSubmission._id,
      compilationError: compilationError, // Send this back for immediate display if needed
      testResults: detailedTestResults // Send this back for immediate display
    });

  } catch (err) {
    // This catch is for unexpected errors during the judging process itself,
    // not compilation or runtime errors which are handled by judgeCodeAgainstAllTestCases
    console.error("Unexpected error during submission judging:", err);

    // Attempt to update verdict to "Error" if something went wrong
    if (savedSubmission) {
      savedSubmission.verdict = "Error"; // Set overall verdict to "Error"
      savedSubmission.errorMessage = err.message || "Unknown error during judging process."; // Use errorMessage
      await savedSubmission.save();
    }
    res.status(500).json({ error: "Submission Failed due to an unexpected server error.", verdict: "Error" });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("user", "username")
      .populate("problem", "title")
      .sort({ submittedAt: -1 }); // Sort by submittedAt
    res.json({ success: true, submissions });
  } catch (err) {
    console.error("Error fetching all submissions:", err);
    res.status(500).json({ error: "Error fetching Submissions" });
  }
};

const getUserSubmissions = async (req, res) => {
  try {
    const userId = req.params.userId;
    if (!userId) {
      return res.status(400).json({ error: "User ID is required." });
    }
    const submissions = await Submission.find({ user: userId })
      .populate("user", "username")
      .populate("problem", "title")
      .sort({ submittedAt: -1 }); // Sort by submittedAt
    return res.status(200).json({ success: true, submissions });
  } catch (err) {
    console.error("Error fetching user submissions:", err);
    return res.status(500).json({ error: "Failed to load submission history." });
  }
};


module.exports = {
  handleSubmission,
  getAllSubmissions,
  getUserSubmissions,
};