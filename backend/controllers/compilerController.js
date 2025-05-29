const { generateFile } = require("../utils/compiler/generateFile");
const { executeCpp } = require("../utils/compiler/executeCpp");
const { generateInputFile } = require("../utils/compiler/generateInputFile");
const Problem = require("../models/Problem");

const runCppCode = async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body;

  if (!code)
    return res.status(400).json({ success: false, error: "Code is required" });

  try {
    const filepath = await generateFile(language, code);
    const inputPath = await generateInputFile(input);
    const output = await executeCpp(language, filepath, inputPath);
    return res.status(200).json({ success: true, filepath, inputPath, output });
  } catch (err) {
    return res.status(500).json({
      success: false,
      compilationError: err.details || err.error || "Unknown execution error",
    });
  }
};

const testAgainstAllCases = async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId)
    return res.status(400).json({ success: false, error: "Missing Fields" });

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) return res.status(404).json({ error: "Problem not found" });

    const results = [];
    const filepath = await generateFile(language, code);

    for (const testCase of problem.testCases) {
      const inputPath = await generateInputFile(testCase.input);
      const output = await executeCpp(language, filepath, inputPath);

      results.push({
        input: testCase.input,
        expected: testCase.output.trim(),
        actual: output.trim(),
        passed: output.trim() === testCase.output.trim(),
      });
    }

    return res.status(200).json({ success: true, results });
  } catch (err) {
    return res.status(500).json({ compilationError: err.details || err.error || "Unknown error during testing" });
  }
};

module.exports = { runCppCode, testAgainstAllCases };
