const { generateFile } = require("./compiler/generateFile");
const { executeCpp } = require("./compiler/executeCpp");
const { generateInputFile } = require("./compiler/generateInputFile");
const fs = require("fs");
const path = require("path");

const judgeCodeAgainstAllTestCases = async (code, language, problemDetails, isSubmission = false) => {
console.log("Judging Engine received problemDetails:", problemDetails);
    let finalVerdict = "Pending";
    let compilationError = null;
    const detailedTestResults = [];
    let codeFilePath = null;
    let overallRuntime = 0;
    let overallMemory = 0;

    try {
        if (!problemDetails || !problemDetails.testCases) {
            finalVerdict = "Error";
            compilationError = "Problem details or test cases missing.";
            return { finalVerdict, compilationError, detailedTestResults: [], overallRuntime: null, overallMemory: null };
        }

        const { testCases, timeLimit, memoryLimit } = problemDetails; 

        let testCasesToJudge = [];
        if (isSubmission) {
            testCasesToJudge = testCases || []; 
        } else {
            testCasesToJudge = (testCases || []).filter(tc => tc.isPublic);
        }
        console.log("Judging Engine determined testCasesToJudge:", testCasesToJudge);

        codeFilePath = await generateFile(language, code);

        if (testCasesToJudge.length === 0) {
            finalVerdict = "Accepted"; 
            return { finalVerdict, compilationError: null, detailedTestResults: [], overallRuntime: null, overallMemory: null };
        }

        let allTestsAccepted = true;
        for (const testCase of testCasesToJudge) {
            let inputPath = null;
            let actualOutput = '';
            let status = 'Error';
            let details = null;
            let time = null;
            let memory = null;

            try {
                inputPath = await generateInputFile(testCase.input);
                const executionResult = await executeCpp(language, codeFilePath, inputPath, false, timeLimit, memoryLimit);

                actualOutput = (executionResult.output || '').trim();
                details = executionResult.error;

                time = executionResult.time || null;
                memory = executionResult.memory || null;

                if (details) {
                    if (details.includes("Compilation Error")) {
                        status = 'Compilation Error';
                        if (!compilationError) compilationError = details;
                    } else if (details.includes("Time Limit Exceeded")) {
                        status = 'Time Limit Exceeded';
                    } else if (details.includes("Runtime Error")) {
                        status = 'Runtime Error';
                    } else if (details.includes("Memory Limit Exceeded")) {
                        status = 'Memory Limit Exceeded';
                    } else {
                        status = 'Error';
                    }
                    allTestsAccepted = false;
                } else if (actualOutput === testCase.output.trim()) {
                    status = 'Accepted';
                } else {
                    status = 'Wrong Answer';
                    allTestsAccepted = false;
                }

                if (status === "Accepted" && time !== null) {
                    overallRuntime += time;
                }
                if (memory !== null) overallMemory = Math.max(overallMemory, memory);

            } catch (execErr) {
                console.error(`Error processing test case:`, execErr);
                status = 'Error';
                details = execErr.message || "Unknown error during test case execution setup.";
                allTestsAccepted = false;
            } finally {
                if (inputPath && fs.existsSync(inputPath)) {
                    fs.unlinkSync(inputPath);
                }
            }

            detailedTestResults.push({
                label: testCase.label || `Test Case ${detailedTestResults.length + 1}`,
                input: isSubmission ? '' : testCase.input, 
                expectedOutput: isSubmission ? '' : testCase.output.trim(),
                actualOutput: actualOutput,
                status: status,
                time: time,
                memory: memory,
                details: details,
            });

            if (status === 'Compilation Error' && !compilationError) {
                compilationError = details;
            }
            if (status !== 'Accepted' && isSubmission) {
                break;
            }
        }

        if (compilationError) {
            finalVerdict = "Compilation Error";
        } else if (allTestsAccepted) {
            finalVerdict = "Accepted";
        } else {
            const statuses = detailedTestResults.map(tr => tr.status);
            if (statuses.includes("Time Limit Exceeded")) {
                finalVerdict = "Time Limit Exceeded";
            } else if (statuses.includes("Memory Limit Exceeded")) {
                finalVerdict = "Memory Limit Exceeded";
            } else if (statuses.includes("Runtime Error")) {
                finalVerdict = "Runtime Error";
            } else if (statuses.includes("Wrong Answer")) {
                finalVerdict = "Wrong Answer";
            } else {
                finalVerdict = "Error"; 
            }
        }

    } catch (outerErr) {
        console.error("Overall judging error (e.g., initial code file generation or unexpected issue):", outerErr);
        finalVerdict = "Compilation Error"; // Default for initial failures
        compilationError = outerErr.details || outerErr.error || outerErr.message || "Internal system error occurred.";

        const mockTestCases = problemDetails && problemDetails.testCases ?
            (isSubmission ? problemDetails.testCases : problemDetails.testCases.filter(tc => tc.isPublic)) : [];

        detailedTestResults.splice(0, detailedTestResults.length); 
        mockTestCases.forEach((tc, index) => {
            detailedTestResults.push({
                label: tc.label || `Test Case ${index + 1}`,
                input: isSubmission ? '' : tc.input,
                expectedOutput: isSubmission ? '' : tc.output.trim(),
                actualOutput: '',
                status: 'Compilation Error',
                time: null, memory: null,
                details: compilationError
            });
        });

    } finally {
        if (codeFilePath && fs.existsSync(codeFilePath)) {
            fs.unlinkSync(codeFilePath);
            if (language === 'cpp') {
                const exePath = codeFilePath.replace('.cpp', '.exe');
                if (fs.existsSync(exePath)) fs.unlinkSync(exePath);
                const aOutPath = path.join(path.dirname(codeFilePath), 'a.out');
                if (fs.existsSync(aOutPath)) fs.unlinkSync(aOutPath);
            } else if (language === 'java') {
                const className = path.basename(codeFilePath, '.java');
                const javaClassFile = path.join(path.dirname(codeFilePath), `${className}.class`);
                if (fs.existsSync(javaClassFile)) fs.unlinkSync(javaClassFile);
            }
        }
    }

    const acceptedTests = detailedTestResults.filter(tr => tr.status === "Accepted");
    const finalOverallRuntime = acceptedTests.length > 0
        ? acceptedTests.reduce((sum, tr) => sum + (tr.time || 0), 0) / acceptedTests.length
        : null; 

    console.log("Judging Engine returning detailedTestResults:", detailedTestResults);
    return {
        finalVerdict,
        compilationError,
        detailedTestResults,
        overallRuntime: finalOverallRuntime,
        overallMemory,
    };
};

module.exports = { judgeCodeAgainstAllTestCases };