const Submission = require("../models/Submission");
const Problem = require("../models/Problem");
const { executeCpp } = require("../utils/compiler/executeCpp");
const fs = require("fs");
const path = require("path");
const { v4: uuidv4 } = require("uuid");

const handleSubmission = async (req, res) => {
  const { userId, problemId, code, language } = req.body;

  if (!userId || !problemId || !code || !language) {
    return res.status(400).json({ error: "Missing required fields" });
  }

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const submission = new Submission({
      user: userId,
      problem: problemId,
      code,
      language,
      status: "pending",
    });

    const savedSubmission = await submission.save();

    const jobId = uuidv4();
    const extMap = {
      cpp: "cpp",
      python: "py",
      javascript: "js",
      java: "java",
    };

    const codeExt = extMap[language];

    if (!codeExt) {
      return res.status(400).json({ error: "Unsupported language" });
    }

    const codeFilePath = path.join(__dirname, "codes", `${jobId}.${codeExt}`);
    const inputFilePath = path.join(__dirname, "inputs", `${jobId}.txt`);

    fs.mkdirSync(path.dirname(codeFilePath), { recursive: true });
    fs.mkdirSync(path.dirname(inputFilePath), { recursive: true });

    fs.writeFileSync(codeFilePath, code, "utf-8");
    fs.writeFileSync(inputFilePath, problem.sampleInput || "", "utf-8");

    const output = await executeCpp(language, codeFilePath, inputFilePath);

    const expected = (problem.sampleOutput || "").trim();
    const actual = (output || "").trim();

    let status = "rejected";
    if (actual === expected) status = "accepted";

    savedSubmission.status = status;
    savedSubmission.runtime = 0;
    await savedSubmission.save();

    res.json({
      submissionId: savedSubmission._id,
      status,
      output: actual,
      expected,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Submission Failed" });
  }
};

const getAllSubmissions = async (req, res) => {
  try {
    const submissions = await Submission.find()
      .populate("user", "username")
      .populate("problem", "title");
    res.json(submissions);
  } catch (err) {
    res.status(500).json({ error: "Error fetching Submissions" });
  }
};

module.exports = {handleSubmission, getAllSubmissions};
