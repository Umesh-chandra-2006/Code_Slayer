const { generateFile } = require("../utils/compiler/generateFile");
const { executeCpp } = require("../utils/compiler/executeCpp");
const { generateInputFile } = require("../utils/compiler/generateInputFile");

const runCppCode = async (req, res) => {
  const { language = "cpp", code, input = "" } = req.body;

  if (!code)
    return res.status(400).json({ success: false, error: "Code is required" });

  try {
    const filepath = await generateFile(language, code);
    const inputPath = await generateInputFile(input);
    const output = await executeCpp(language,filepath, inputPath);
    return res.status(200).json({ success: true, filepath, inputPath, output });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: err.stderr || err.error || "Unknown execution error"
    });
  }
};

module.exports = { runCppCode };
