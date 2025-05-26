const fs = require("fs");
const path = require("path");
const { v4: uuid } = require("uuid");
const { executeCpp } = require("./executeCpp");

const runTest = async (language, code, input = "") => {
  const jobId = uuid();
  const extMap = {
    cpp: "cpp",
    python: "py",
    javascript: "js",
    java: "java",
  };

  const extension = extMap[language];
  if (!extension) {
    console.error("Unsupported language");
    return;
  }

  const codePath = path.join(__dirname, "codes", `${jobId}.${extension}`);
  const inputPath = path.join(__dirname, "inputs", `${jobId}.txt`);

  fs.mkdirSync(path.dirname(codePath), { recursive: true });
  fs.mkdirSync(path.dirname(inputPath), { recursive: true });

  fs.writeFileSync(codePath, code, "utf-8");
  fs.writeFileSync(inputPath, input, "utf-8");

  try {
    const output = await executeCpp(language, codePath, inputPath);
    console.log("✅ Output:\n", output);
  } catch (err) {
    console.error("❌ Error:\n", err.stderr || err.error.message);
  }
};

// 🔁 Example: Run this file directly to test
const sampleCppCode = `
#include<iostream>
using namespace std;
int main() {
    int a, b;
    cin >> a >> b;
    cout << a + b << endl;
    return 0;
}
`;

const sampleInput = "3 7";

runTest("cpp", sampleCppCode, sampleInput);
