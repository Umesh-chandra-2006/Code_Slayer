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
  const outPath = path.join(outputDir, `${jobID}.exe`);

  let command;

  switch (language) {
    case "cpp":
      command = `g++ "${filepath}" -o "${outPath}" && cd "${outputDir}" && .\\${jobID}.exe < "${inputPath}"`;
      break;

    case "python":
      command = `python "${filepath}" < "${inputPath}"`;
      break;

    case "javascript":
      command = `node "${filepath}" < "${inputPath}"`;
      break;

    case "java":
      command = `javac "${filepath}" && java -cp "${fileDir}" Main < "${inputPath}"`;
      break;

    default:
      return Promise.reject({ error: `Unsupported language: ${language}` });
  }
  
  console.log("\n[Compiler Log]");
  console.log("Language:", language);
  console.log("Source File:", filepath);
  console.log("Input File:", inputPath);
  console.log("Command:", command, "\n");

  return new Promise((resolve, reject) => {
    exec(command,{timeout:5000}, (error, stdout, stderr) => {
      if (error) {
        console.error("[Execution Error]", error);
        return reject({
          error: "Execution failed",
          details: stderr || error.message,
        });
      }
      if (stderr) console.warn("STDERR:", stderr);
      resolve(stdout);
    });
  });
};

module.exports = { executeCpp };
