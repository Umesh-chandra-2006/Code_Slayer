const { generateFile } = require("../utils/compiler/generateFile");
const { executeCpp } = require("../utils/compiler/executeCpp");
const { generateInputFile } = require("../utils/compiler/generateInputFile");
const { judgeCodeAgainstAllTestCases } = require("../utils/judgingEngine");
const fs = require("fs");
const path = require("path");

// Handles custom code execution (Frontend's "Run Code" request)
const handleExecuteCode = async (req, res) => {
    const { language = "cpp", code, input = "" } = req.body;
    if (!code) return res.status(400).json({ success: false, error: "Code is required" });

    let filepath = null;
    let inputPath = null;
    try {
        filepath = await generateFile(language, code);
        inputPath = await generateInputFile(input);
        const result = await executeCpp(language, filepath, inputPath);
        let compilationError = null;
        let runtimeError = null;
        if (result.error) {
            if (result.error.includes("Compilation Error")) {
                compilationError = result.error;
            } else {
                runtimeError = result.error;
            }
        }
        return res.status(200).json({
            success: true,
            output: result.output || "",
            compilationError: compilationError,
            runtimeError: runtimeError,
            time: result.time,
            memory: result.memory
        });
    } catch (err) {
        console.error("Error in handleExecuteCode (Compiler Backend):", err);
        let errorToSend = err.details || err.error || err.message || "Unknown execution error";
        let isCompilationError = errorToSend.includes("Compilation Error");
        return res.status(500).json({
            success: false,
            compilationError: isCompilationError ? errorToSend : null,
            runtimeError: !isCompilationError ? errorToSend : null,
            output: "", time: null, memory: null
        });
    } finally {
        if (filepath && fs.existsSync(filepath)) {
            fs.unlinkSync(filepath);
            if (language === 'cpp') {
                const exePath = filepath.replace('.cpp', '.exe');
                if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
                const aOutPath = path.join(path.dirname(filepath), 'a.out');
                if (fs.existsSync(aOutPath)) fs.unlinkSync(aOutPath);
            } else if (language === 'java') {
                const javaClassFile = path.join(path.dirname(filepath), `${path.basename(filepath, '.java')}.class`);
                if (fs.existsSync(javaClassFile)) fs.unlinkSync(javaClassFile);
            }
        }
        if (inputPath && fs.existsSync(inputPath)) {
            fs.unlinkSync(inputPath);
        }
    }
};

// Handles code judging against provided test cases (
const handleJudgeCode = async (req, res) => {
    const { code, language, problemDetails, isSubmission } = req.body;
        console.log("Compiler Backend (compilerServiceController): Received isSubmission =", isSubmission, "(Type:", typeof isSubmission + ")");

    if (!code || !language || !problemDetails){
        return res.status(400).json({
            success: false,
            error: "Missing required fields for judging.",
            overallVerdict: "Error",
            compilationError: "Missing input parameters.",
            testResults: [], 
            overallRuntime: null,
            overallMemory: null
        });
    }

    try {
        // This function uses the local utils/judgingEngine.js
        const { finalVerdict, compilationError, detailedTestResults, overallRuntime, overallMemory } =
            await judgeCodeAgainstAllTestCases(code, language, problemDetails, isSubmission);

        return res.status(200).json({
            success: true,
            overallVerdict: finalVerdict,
            compilationError: compilationError,
            testResults: detailedTestResults,
            overallRuntime: overallRuntime,
            overallMemory: overallMemory,
        });
    } catch (err) {
        console.error("Error in handleJudgeCode (Compiler Backend):", err);
        return res.status(500).json({
            success: false,
            error: err.details || err.error || err.message || "Unknown error during judging process in compiler backend",
            overallVerdict: "Error", 
            compilationError: err.details || err.error || err.message || "Internal server error occurred.",
            testResults: [], // 
            overallRuntime: null,
            overallMemory: null,
        });
    }
};

module.exports = { handleExecuteCode, handleJudgeCode };