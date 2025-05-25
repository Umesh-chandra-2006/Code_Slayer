const { exec } = require("child_process");
const { Resolver } = require("dns");
const fs = require("fs");
const path = require("path");
const { stderr } = require("process");

const outputDir = path.join(__dirname, "outputs");
const inputDir = path.join(__dirname, "inputs");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });

const executeCpp = (language,filepath, inputPath) => {
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
  command = `javac "${filepath}" && java -cp "${fileDir}" Main < "${inputPath}"`;      break;

    default:
      return Promise.reject({ error: `Unsupported language: ${language}` });
  }
  console.log("\n[Compiler Log]");
  console.log("Language:", language);
  console.log("Source File Path:", filepath);
  if (language === "cpp") console.log("Output Executable Path:", outPath);
  else if (language === "java") console.log("Java Class Directory:", fileDir);
  console.log("Input File Path:", inputPath);
  console.log("Full Command:", command, "\n");


  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
                console.error("[Execution Error]", error);
        console.error("[STDERR]", stderr);
        return reject({ error, stderr });
      }
      if (stderr) console.warn("STDERR:", stderr);
      resolve(stdout);
    });
  });
};

module.exports = { executeCpp };
