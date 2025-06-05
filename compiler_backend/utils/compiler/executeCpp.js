const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "outputs");
const inputDir = path.join(__dirname, "inputs");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });

function cleanCompilerError(stderr) {
    if (!stderr) return '';

    let lines = stderr.split('\n');
    let cleanedLines = [];

    for (let line of lines) {
        line = line.trim();

        if (line.startsWith('In file included from') || line.match(/^(?:[a-zA-Z]:)?[\/\\](?:[^:\n]+\\)*[^:\n]+:\d+:\d+:\s*note:/)) {
            continue;
        }

        line = line.replace(/In function '.*?'(?::)?\s*/g, '').trim();

        const leadingPathRegex = /^(?:(?:[a-zA-Z]:)?[\/\\](?:[^:\n]+\\)*[^:\n]+\.(?:cpp|c|hpp|h|java|js|py)(?::\d+:\d+)?(?:\s*(?:error|warning|note|fatal error):)?\s*|\d+:\d+:\s*(?:error|warning|note|fatal error):?\s*)/;
        let match = line.match(leadingPathRegex);

        if (match) {
            line = line.substring(match[0].length).trim();
        }

        if (line) {
            cleanedLines.push(line);
        }
    }

    return cleanedLines.join('\n');
}

const executeCpp = (language, filepath, inputPath) => {
  const jobID = path.basename(filepath).split(".")[0];
  const fileDir = path.dirname(filepath);
  let outPath;

  let compileCommand;
  let executeCommand;

  switch (language) {
    case "cpp":
      outPath = path.join(outputDir, `${jobID}.exe`);
      compileCommand = `g++ "${filepath}" -o "${outPath}"`;
      executeCommand = `"${outPath}" < "${inputPath}"`;

      if (process.platform !== "win32") {
        outPath = path.join(fileDir, `a.out`);
        compileCommand = `g++ "${filepath}" -o "${outPath}"`;
        executeCommand = `"${outPath}" < "${inputPath}"`;
      }
      break;

    case "python":
      compileCommand = null;
      executeCommand = `python "${filepath}" < "${inputPath}"`;
      break;

    case "javascript":
      compileCommand = null;
      executeCommand = `node "${filepath}" < "${inputPath}"`;
      break;

    case "java":
      compileCommand = `javac "${filepath}"`;
      executeCommand = `java -cp "${fileDir}" ${filenameWithoutExt(
        filepath
      )} < "${inputPath}"`;
      break;

    default:
      return Promise.resolve({
        output: "",
        error: `Unsupported language: ${language}`,
        time: null,
        memory: null,
      });
  }

  console.log("\n[Compiler Log]");
  console.log("Language:", language);
  console.log("Source File:", filepath);
  console.log("Input File:", inputPath);
  console.log("Compile Command:", compileCommand);
  console.log("Execute Command:", executeCommand, "\n");

  return new Promise(async (resolve) => {
    let output = "";
    let error = null;
    let time = null;
    let memory = null;

    try {
      // Step 1: Compile (if a compileCommand exists)
      if (compileCommand) {
        const { stderr: compileStderr } = await new Promise((res, rej) => {
          exec(compileCommand, { timeout: 5000 }, (err, stdout, stderr) => {
            if (err) {
              res({ err, stdout, stderr });
            } else {
              res({ err: null, stdout, stderr });
            }
          });
        });

        if (compileStderr) {
          const cleanedError = cleanCompilerError(compileStderr);
          error = `Compilation Error:\n${cleanedError}`;
          if (fs.existsSync(outPath) && language === "cpp")
            fs.unlinkSync(outPath);
          return resolve({ output, error, time, memory });
        }
      }

      // Step 2: Execute
      const startTime = process.hrtime.bigint();
      const executionResult = await new Promise((res, rej) => {
        exec(executeCommand, { timeout: 5000 }, (err, stdout, stderr) => {
          const endTime = process.hrtime.bigint();
          const timeTakenMs = Number(endTime - startTime) / 1_000_000;

          if (err) {
            let errMessage = stderr || err.message;
            if (err.killed && err.signal === "SIGTERM") {
              errMessage = "Time Limit Exceeded";
            } else {
              errMessage = `Runtime Error:\n${errMessage}`;
            }
            res({ err: errMessage, stdout, stderr: "", time: timeTakenMs });
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
        error = `Runtime Warning/Error:\n${executionResult.stderr}`;
      }
    } catch (err) {
      error = `System Error during execution: ${err.message}`;
    } finally {
      if (language === "cpp" && outPath && fs.existsSync(outPath)) {
        fs.unlinkSync(outPath);
      } else if (language === "java") {
        const javaClassFile = path.join(
          fileDir,
          `${filenameWithoutExt(filepath)}.class`
        );
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
