const { generateFile } = require("../utils/compiler/generateFile");
const { executeCpp } = require("../utils/compiler/executeCpp");

const runCppCode = async (req, res) => {
  const { language = "cpp", code } = req.body;

  if (!code)
    return res.status(400).json({ success: false, error: "Code is required" });

  try {
    const filepath = await generateFile(language, code);
    const output = await executeCpp(filepath);
    return res.status(200).json({ success: true, filepath, output });
  } catch (err) {
    return res.status(500).json({ success: false, err });
  }
};

module.exports = { runCppCode };
