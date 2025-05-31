// backend/utils/judgingEngine.js
const { generateFile } = require("./compiler/generateFile");
const { executeCpp } = require("./compiler/executeCpp"); // Now returns { output, error, time, memory }
const { generateInputFile } = require("./compiler/generateInputFile");
const Problem = require("../models/Problem");
const fs = require("fs");
const path = require("path");

/**
 * Judges a user's code against all test cases for a given problem.
 * @param {string} code - The user's submitted code.
 * @param {string} language - The language of the code (e.g., 'cpp', 'python').
 * @param {string} problemId - The ID of the problem.
 * @returns {Promise<{
 * finalVerdict: string,
 * compilationError: string | null,
 * detailedTestResults: Array<{
 * input: string,
 * expectedOutput: string,
 * actualOutput: string,
 * status: string, // e.g., 'Accepted', 'Wrong Answer', 'Runtime Error', 'Time Limit Exceeded', 'Compilation Error'
 * time: number | null,
 * memory: number | null,
 * details: string | null // Specific error message for this test case
 * }>,
 * overallRuntime: number | null,
 * overallMemory: number | null
 * }>} - An object containing the overall verdict and detailed test results.
 */
const judgeCodeAgainstAllTestCases = async (code, language, problemId) => {
  let finalVerdict = "Pending";
  let compilationError = null;
  const detailedTestResults = [];
  let codeFilePath = null;
  let overallRuntime = 0; // Sum of runtimes for accepted tests
  let overallMemory = 0; // Max memory across all tests

  try {
    const problem = await Problem.findById(problemId);
    if (!problem) {
      finalVerdict = "Error";
      compilationError = "Problem Not Found";
      return { finalVerdict, compilationError, detailedTestResults, overallRuntime: null, overallMemory: null };
    }

    // Attempt to generate code file first (this is where compilation errors are caught for C++/Java)
    codeFilePath = await generateFile(language, code);

    // If there are no test cases, it's an "Accepted" by default if it compiles
    if (problem.testCases.length === 0) {
        finalVerdict = "Accepted";
        return { finalVerdict, compilationError: null, detailedTestResults: [], overallRuntime: null, overallMemory: null };
    }

    let allTestsAccepted = true;
    for (const testCase of problem.testCases) {
      let inputPath = null;
      let actualOutput = '';
      let status = 'Error'; // Default to error
      let details = null;
      let time = null;
      let memory = null;

      try {
        inputPath = await generateInputFile(testCase.input);
        const executionResult = await executeCpp(language, codeFilePath, inputPath); // Returns { output, error, time, memory }

        actualOutput = (executionResult.output || '').trim();
        details = executionResult.error; // This will contain compilation error, runtime error, TLE message

        time = executionResult.time || null;
        memory = executionResult.memory || null;

        if (details) {
          // Determine status based on the error message
          if (details.includes("Compilation Error")) {
            status = 'Compilation Error';
            // If even one test case results in compilation error, the overall verdict is Compilation Error
            // We should ideally catch this at `generateFile` or first `executeCpp` run
            // However, if `executeCpp` itself returns a compilation error for a specific test run (less common), handle it.
            // For a single submission, a compilation error makes all tests fail with that status.
            compilationError = details; // Capture the first compilation error
          } else if (details.includes("Time Limit Exceeded")) {
            status = 'Time Limit Exceeded';
          } else if (details.includes("Runtime Error")) {
            status = 'Runtime Error';
          } else {
            status = 'Error'; // Catch any other unexpected error from executeCpp
          }
          allTestsAccepted = false; // A failed test means overall not accepted
        } else if (actualOutput === testCase.output.trim()) {
          status = 'Accepted';
        } else {
          status = 'Wrong Answer';
          allTestsAccepted = false; // A failed test means overall not accepted
        }

        // Aggregate overall runtime and memory only for accepted tests or if we need average/max across all tests
        if (status === "Accepted" && time) {
            overallRuntime += time;
        }
        if (memory) overallMemory = Math.max(overallMemory, memory); // Max memory across all tests

      } catch (execErr) {
        // This catches errors from `generateInputFile` or unexpected issues during specific test case setup
        console.error(`Error processing test case for problem ${problemId}:`, execErr);
        status = 'Error';
        details = execErr.message || "Unknown error during test case execution setup.";
        allTestsAccepted = false;
      } finally {
        if (inputPath && fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
      }

      detailedTestResults.push({
        input: testCase.input,
        expectedOutput: testCase.output.trim(),
        actualOutput: actualOutput,
        status: status,
        time: time,
        memory: memory,
        details: details,
      });

      // If compilation error occurs for any test, we might stop further processing or ensure the overall verdict reflects it.
      if (status === 'Compilation Error' && !compilationError) { // Set overall compilation error if not already set
          compilationError = details;
          finalVerdict = 'Compilation Error';
          // Optionally, you might break here if a compilation error means no further tests can run meaningfully.
          // For now, we continue to mark all tests for completeness, but the overall verdict is set.
      }
    }

    // Determine final verdict based on all test cases
    if (compilationError) {
        finalVerdict = "Compilation Error";
    } else if (allTestsAccepted) {
      finalVerdict = "Accepted";
    } else {
      // Find the "worst" verdict for the overall submission
      const statuses = detailedTestResults.map(tr => tr.status);
      if (statuses.includes("Time Limit Exceeded")) {
        finalVerdict = "Time Limit Exceeded";
      } else if (statuses.includes("Runtime Error")) {
        finalVerdict = "Runtime Error";
      } else if (statuses.includes("Wrong Answer")) {
        finalVerdict = "Wrong Answer";
      } else {
        finalVerdict = "Error"; // Fallback for other issues
      }
    }

  } catch (outerErr) {
    // This outer catch block primarily handles errors from `generateFile`
    console.error("Overall judging error (e.g., initial compilation or file generation):", outerErr);
    finalVerdict = "Compilation Error"; // Most likely a compilation error if it fails before test cases
    compilationError = outerErr.details || outerErr.error || outerErr.message || "Code failed to compile or system error occurred.";

    // If compilation fails, we mark all tests as "Compilation Error"
    const problem = await Problem.findById(problemId);
    const mockTestResults = (problem?.testCases || []).map(tc => ({
        input: tc.input,
        expectedOutput: tc.output.trim(),
        actualOutput: '',
        status: 'Compilation Error',
        time: null, memory: null,
        details: compilationError
    }));
    detailedTestResults.splice(0, detailedTestResults.length, ...mockTestResults); // Replace existing results
  } finally {
    // Clean up generated code file and any executables
    if (codeFilePath && fs.existsSync(codeFilePath)) {
        fs.unlinkSync(codeFilePath);
        // Additional cleanup for executables based on language
        if (language === 'cpp') {
            const exePath = codeFilePath.replace('.cpp', '.exe');
            if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
            const aOutPath = path.join(path.dirname(codeFilePath), 'a.out');
            if (fs.existsSync(aOutPath)) fs.unlinkSync(aOutPath);
        } else if (language === 'java') {
             const javaClassFile = path.join(path.dirname(codeFilePath), `${path.basename(codeFilePath, '.java')}.class`);
             if (fs.existsSync(javaClassFile)) fs.unlinkSync(javaClassFile);
        }
    }
  }

  // Calculate average runtime for accepted tests, or keep null if not applicable
  const finalOverallRuntime = finalVerdict === "Accepted" && detailedTestResults.length > 0
    ? overallRuntime / detailedTestResults.filter(tr => tr.status === "Accepted").length
    : null;

  return {
    finalVerdict,
    compilationError,
    detailedTestResults,
    overallRuntime: finalOverallRuntime,
    overallMemory,
  };
};

module.exports = { judgeCodeAgainstAllTestCases };