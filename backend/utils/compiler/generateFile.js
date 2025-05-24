const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const codesDir = path.join(__dirname, "codes");

if (!fs.existsSync(codesDir)) fs.mkdirSync(codesDir, { recursive: true });

const generateFile = async (format, content) => {
  const jobID = uuid();
  const filename = `${jobID}.${format}`;
  const filepath = path.join(codesDir, filename);

  fs.writeFileSync(filepath, content);
  return filepath;
};

module.exports = { generateFile };
