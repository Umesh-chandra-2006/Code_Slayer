// backend/utils/compiler/executeCpp.js
const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "outputs");
const inputDir = path.join(__dirname, "inputs");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });

const executeCpp = (language, filepath, inputPath) => {
  const jobID = path.basename(filepath).split(".")[0];
  const fileDir = path.dirname(filepath);
  let outPath; // For compiled executables

  let compileCommand;
  let executeCommand;

  switch (language) {
    case "cpp":
      // For C++, we compile first, then execute. Errors during compile are compilation errors.
      // Errors during execution (after successful compile) are runtime errors.
      outPath = path.join(outputDir, `${jobID}.exe`); // Windows executable
      compileCommand = `g++ "${filepath}" -o "${outPath}"`;
      executeCommand = `"${outPath}" < "${inputPath}"`;

      // Adjust for non-Windows platforms if necessary (e.g., using a.out)
      if (process.platform !== "win32") {
        outPath = path.join(fileDir, `a.out`); // Default for Linux/macOS
        compileCommand = `g++ "${filepath}" -o "${outPath}"`;
        executeCommand = `"${outPath}" < "${inputPath}"`;
      }
      break;

    case "python":
      // Python doesn't have a separate "compile" step like C++/Java.
      // Syntax errors are found during parsing, and execution errors are runtime.
      compileCommand = null; // No explicit compile command
      executeCommand = `python "${filepath}" < "${inputPath}"`;
      break;

    case "javascript":
      compileCommand = null; // No explicit compile command
      executeCommand = `node "${filepath}" < "${inputPath}"`;
      break;

    case "java":
      // Java needs compilation first.
      compileCommand = `javac "${filepath}"`;
      executeCommand = `java -cp "${fileDir}" ${filenameWithoutExt(filepath)} < "${inputPath}"`;
      break;

    default:
      return Promise.resolve({ output: '', error: `Unsupported language: ${language}`, time: null, memory: null });
  }

  console.log("\n[Compiler Log]");
  console.log("Language:", language);
  console.log("Source File:", filepath);
  console.log("Input File:", inputPath);
  console.log("Compile Command:", compileCommand);
  console.log("Execute Command:", executeCommand, "\n");

  return new Promise(async (resolve) => {
    let output = '';
    let error = null;
    let time = null;
    let memory = null; // Still a placeholder, requires more advanced OS-level monitoring

    try {
      // Step 1: Compile (if a compileCommand exists)
      if (compileCommand) {
        const { stderr: compileStderr } = await new Promise((res, rej) => {
          exec(compileCommand, { timeout: 5000 }, (err, stdout, stderr) => { // Use timeout for compilation too
            if (err) {
              res({ err, stdout, stderr }); // Resolve with error to check for compilation issues
            } else {
              res({ err: null, stdout, stderr });
            }
          });
        });

        if (compileStderr) {
          // If there's anything in stderr during compilation, it's a compilation error
          // Note: Some compilers output warnings to stderr even on success.
          // You might need to refine this check based on actual compiler output.
          error = `Compilation Error:\n${compileStderr}`;
          if (fs.existsSync(outPath) && language === 'cpp') fs.unlinkSync(outPath); // Clean up partial executable
          return resolve({ output, error, time, memory });
        }
      }

      // Step 2: Execute
      const startTime = process.hrtime.bigint(); // Start time for execution
      const executionResult = await new Promise((res, rej) => {
        exec(executeCommand, { timeout: 5000 }, (err, stdout, stderr) => { // Use timeout for execution
          const endTime = process.hrtime.bigint();
          const timeTakenMs = Number(endTime - startTime) / 1_000_000; // Convert nanoseconds to milliseconds

          if (err) {
            let errMessage = stderr || err.message;
            if (err.killed && err.signal === 'SIGTERM') {
              errMessage = "Time Limit Exceeded"; // If process was killed by timeout
            } else {
              errMessage = `Runtime Error:\n${errMessage}`; // Generic runtime error
            }
            res({ err: errMessage, stdout, stderr: '' , time: timeTakenMs}); // Resolve with error for runtime issues
          } else {
            res({ err: null, stdout, stderr, time: timeTakenMs });
          }
        });
      });

      output = executionResult.stdout.trim();
      time = executionResult.time;

      if (executionResult.err) {
        error = executionResult.err;
      } else if (executionResult.stderr && executionResult.stderr.trim()) {
        // Any remaining stderr from execution (not compilation) is likely a runtime issue
        error = `Runtime Warning/Error:\n${executionResult.stderr}`;
      }

    } catch (err) {
      // Catch unexpected errors during the `exec` calls themselves
      error = `System Error during execution: ${err.message}`;
    } finally {
      // Clean up generated executables for C++ (and class files for Java)
      if (language === 'cpp' && outPath && fs.existsSync(outPath)) {
          fs.unlinkSync(outPath);
      } else if (language === 'java') {
          const javaClassFile = path.join(fileDir, `${filenameWithoutExt(filepath)}.class`);
          if (fs.existsSync(javaClassFile)) {
              fs.unlinkSync(javaClassFile);
          }
      }
    }

    resolve({ output, error, time, memory });
  });
};

function filenameWithoutExt(filepath) {
  return path.basename(filepath, path.extname(filepath));
}

module.exports = { executeCpp };