const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");

const codesDir = path.join(__dirname, "codes");

if (!fs.existsSync(codesDir)) fs.mkdirSync(codesDir, { recursive: true });


const generateFile = async (language, content) => {

  let filename;
  if(language === "java") {
    filename = `Main.java`;
  } else {
    const extMap = { cpp: "cpp", python: "py", javascript: "js" };
    const extension = extMap[language] || "txt";
    filename = `${uuid()}.${extension}`;
  }
  const filepath = path.join(codesDir, filename);

  fs.writeFileSync(filepath, content);
  return filepath;
};

module.exports = { generateFile };
