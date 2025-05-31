const { generateFile } = require("../utils/compiler/generateFile");
const { executeCpp } = require("../utils/compiler/executeCpp"); // Now returns { output, error, time, memory }
const { generateInputFile } = require("../utils/compiler/generateInputFile");
const Problem = require("../models/Problem");
const { judgeCodeAgainstAllTestCases } = require("../utils/judgingEngine"); // IMPORT THE NEW UTILITY HERE
const fs = require("fs");
const path = require("path");

const runCppCode = async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body;

  if (!code)
    return res.status(400).json({ success: false, error: "Code is required" });

  let filepath = null;
  let inputPath = null;

  try {
    filepath = await generateFile(language, code);
    inputPath = await generateInputFile(input);

    const result = await executeCpp(language, filepath, inputPath); // executeCpp now returns { output, error, time, memory }

    // Differentiate between compilation error and runtime error based on `result.error` content
    let compilationError = null;
    let runtimeError = null;

    if (result.error) {
        if (result.error.includes("Compilation Error")) {
            compilationError = result.error;
        } else {
            runtimeError = result.error;
        }
    }

    return res.status(200).json({
        success: true,
        output: result.output || "",
        compilationError: compilationError,
        runtimeError: runtimeError,
        time: result.time,
        memory: result.memory
    });
  } catch (err) {
    console.error("Error in runCppCode:", err);
    // Catch errors from `generateFile` or unexpected system errors
    let errorToSend = err.details || err.error || err.message || "Unknown execution error";
    let isCompilationError = errorToSend.includes("Compilation Error"); // Simple check
    return res.status(500).json({
      success: false,
      compilationError: isCompilationError ? errorToSend : null,
      runtimeError: !isCompilationError ? errorToSend : null,
      output: "", // No output on error
      time: null,
      memory: null
    });
  } finally {
    // Clean up files
    if (filepath && fs.existsSync(filepath)) {
      fs.unlinkSync(filepath);
      // Clean up executables for C++ and Java
      if (language === 'cpp') {
          const exePath = filepath.replace('.cpp', '.exe');
          if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
          const aOutPath = path.join(path.dirname(filepath), 'a.out');
          if (fs.existsSync(aOutPath)) fs.unlinkSync(aOutPath);
      } else if (language === 'java') {
           const javaClassFile = path.join(path.dirname(filepath), `${path.basename(filepath, '.java')}.class`);
           if (fs.existsSync(javaClassFile)) fs.unlinkSync(javaClassFile);
      }
    }
    if (inputPath && fs.existsSync(inputPath)) {
      fs.unlinkSync(inputPath);
    }
  }
};


const testAgainstAllCases = async (req, res) => {
  const { code, language, problemId } = req.body;

  if (!code || !language || !problemId)
    return res.status(400).json({ success: false, error: "Missing Fields" });

  try {
    // Call the shared judging engine
    const { finalVerdict, compilationError, detailedTestResults } = await judgeCodeAgainstAllTestCases(code, language, problemId);

    // compilerController's test endpoint just needs to return test results and compilation error
    return res.status(200).json({
      success: true,
      overallVerdict: finalVerdict,
      compilationError: compilationError,
      testResults: detailedTestResults, // Ensure frontend expects this name
    });
  } catch (err) {
    console.error("Error in testAgainstAllCases (compilerController):", err);
    return res
      .status(500)
      .json({
        compilationError:
          err.details ||
          err.error ||
          err.message ||
          "Unknown error during testing",
      });
  }
};

module.exports = { runCppCode, testAgainstAllCases };