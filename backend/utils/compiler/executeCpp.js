const { exec } = require("child_process");
const { Resolver } = require("dns");
const fs = require("fs");
const path = require("path");
const { stderr } = require("process");

const outputDir = path.join(__dirname, "outputs");

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });

const executeCpp = (filepath) => {
  const jobID = path.basename(filepath).split(".")[0];
  const outpath = path.join(outputDir, `${jobID}.exe`);

  return new Promise((resolve, reject) => {
    exec(
      `g++ ${filepath} -o ${outpath} && cd ${outputDir} && .\\${jobID}.exe`,
      (error, stdout, stderr) => {
        if (error) return reject({ error, stderr });
        if (stderr) return reject({ stderr });
        resolve(stdout);
      }
    );
  });
};

module.exports = { executeCpp };
