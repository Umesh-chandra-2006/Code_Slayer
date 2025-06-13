const { exec } = require("child_process");
const fs = require("fs");
const path = require("path");

const outputDir = path.join(__dirname, "outputs");
const inputDir = path.join(__dirname, "inputs");

// Define a constant for maximum output size to detect Output Limit Exceeded
const MAX_OUTPUT_SIZE_BYTES = 50 * 1024 * 1024; // Example: 50 MB limit

if (!fs.existsSync(outputDir)) fs.mkdirSync(outputDir, { recursive: true });
if (!fs.existsSync(inputDir)) fs.mkdirSync(inputDir, { recursive: true });

function cleanCompilerError(stderr) {
    if (!stderr) return '';

    let lines = stderr.split('\n');
    let cleanedLines = [];

    for (let line of lines) {
        line = line.trim();

        // Skip lines related to standard library includes or compiler notes
        if (line.startsWith('In file included from') || line.match(/^(?:[a-zA-Z]:)?[\/\\](?:[^:\n]+\\)*[^:\n]+:\d+:\d+:\s*note:/)) {
            continue;
        }

        // Remove "In function '...'" parts which are often verbose
        line = line.replace(/In function '.*?'(?::)?\s*/g, '').trim();

        // Remove leading file paths and line/column numbers, and error/warning/note prefixes
        const leadingPathRegex = /^(?:(?:[a-zA-Z]:)?[\/\\](?:[^:\n]+\\)*[^:\n]+\.(?:cpp|c|hpp|h|java|js|py)(?::\d+:\d+)?(?:\s*(?:error|warning|note|fatal error):)?\s*|\d+:\d+:\s*(?:error|warning|note|fatal error):?\s*)/;
        let match = line.match(leadingPathRegex);

        if (match) {
            line = line.substring(match[0].length).trim();
        }

        if (line) {
            cleanedLines.push(line);
        }
    }

    return cleanedLines.join('\n');
}

// Added timeLimit and memoryLimit parameters to the function signature
const executeCpp = (language, filepath, inputPath, timeLimit, memoryLimit) => {
    const jobID = path.basename(filepath).split(".")[0];
    const fileDir = path.dirname(filepath);
    let outPath; 

    let compileCommand;
    let executeCommand;

    switch (language) {
        case "cpp":
            outPath = path.join(outputDir, `${jobID}.exe`);
            compileCommand = `g++ "${filepath}" -o "${outPath}"`;
            executeCommand = `"${outPath}" < "${inputPath}"`;

            if (process.platform !== "win32") {
                outPath = path.join(fileDir, `a.out`);
                compileCommand = `g++ "${filepath}" -o "${outPath}"`;
                executeCommand = `"${outPath}" < "${inputPath}"`;
            }
            break;

        case "python":
            compileCommand = null; // Python is interpreted, no explicit compile step
            executeCommand = `python "${filepath}" < "${inputPath}"`;
            break;

        case "javascript":
            compileCommand = null; // JavaScript is interpreted by Node.js
            executeCommand = `node "${filepath}" < "${inputPath}"`;
            break;

        case "java":
            compileCommand = `javac "${filepath}"`; // Java compiles to .class files
            // For Java, execution requires the class path pointing to the directory containing the .class file
            executeCommand = `java -cp "${fileDir}" ${filenameWithoutExt(filepath)} < "${inputPath}"`;
            break;

        default:
            return Promise.resolve({
                output: "",
                error: `Unsupported language: ${language}`,
                time: null,
                memory: null,
            });
    }

    return new Promise(async (resolve) => {
        let output = "";
        let error = null;
        let time = null;
        let memory = null; 

        try {
            // Step 1: Compile (if a compileCommand exists for the language)
            if (compileCommand) {
                const { stderr: compileStderr } = await new Promise((res, rej) => {
                    exec(compileCommand, { timeout: 5000 }, (err, stdout, stderr) => {
                        // Pass err, stdout, stderr directly to differentiate compile errors
                        if (err) {
                            res({ err, stdout, stderr });
                        } else {
                            res({ err: null, stdout, stderr });
                        }
                    });
                });

                if (compileStderr) {
                    const cleanedError = cleanCompilerError(compileStderr);
                    error = `Compilation Error:\n${cleanedError}`;
                    if (language === "cpp" && outPath && fs.existsSync(outPath)) {
                        try {
                            fs.unlinkSync(outPath);
                        } catch (unlinkErr) {
                            console.error(`Error deleting partial C++ executable ${outPath} after compile error:`, unlinkErr.message);
                        }
                    }
                    return resolve({ output, error, time, memory }); 
                }
            }

            // Step 2: Execute the compiled/interpreted code
            const executionOptions = {
                timeout: (timeLimit || 5000), 
                killSignal: 'SIGKILL',     
                maxBuffer: MAX_OUTPUT_SIZE_BYTES 
            };

            const startTime = process.hrtime.bigint(); 
            const executionResult = await new Promise((res) => {
                exec(executeCommand, executionOptions, (err, stdout, stderr) => {
                    const endTime = process.hrtime.bigint();
                    const timeTakenMs = Number(endTime - startTime) / 1_000_000;

                    let currentError = null;
                    let processOutput = stdout || '';
                    let processStderr = stderr || '';

                    if (err && err.killed && err.signal === 'SIGKILL') {
                        currentError = "Time Limit Exceeded";
                        processOutput = '';
                    }
                    else if (err && (err.message || '').includes('maxBuffer')) {
                        currentError = "Output Limit Exceeded";
                        processOutput = ''; 
                    }
                    else if (err) {
                        currentError = `Runtime Error:\n${processStderr || err.message}`;
                    }
                    else if (processStderr.trim()) {
                        currentError = `Runtime Warning/Error:\n${processStderr}`;
                    }

                    res({ err: currentError, stdout: processOutput, stderr: processStderr, time: timeTakenMs });
                });
            });

            output = executionResult.stdout.trim(); 
            time = executionResult.time;

            if (executionResult.err) {
                error = executionResult.err;
            }

        } catch (err) {
            error = `System Error during execution: ${err.message}`;
        } finally {
            if (language === "cpp") {
                const executablePath = (process.platform === "win32") ? outPath : path.join(fileDir, 'a.out');
                
                if (executablePath && fs.existsSync(executablePath)) {
                    try {
                        fs.unlinkSync(executablePath);
                    } catch (unlinkErr) {
                        console.error(`Error deleting C++ executable ${executablePath}:`, unlinkErr.message);
                    }
                }
                if (process.platform === "win32" && outPath && outPath !== path.join(fileDir, 'a.out')) {
                    const aOutPath = path.join(fileDir, 'a.out');
                    if (fs.existsSync(aOutPath)) {
                        try {
                            fs.unlinkSync(aOutPath);
                        } catch (unlinkErr) {
                            console.error(`Error deleting a.out file (${aOutPath}):`, unlinkErr.message);
                        }
                    }
                }
            } else if (language === "java") {
                const javaClassFile = path.join(
                    fileDir,
                    `${filenameWithoutExt(filepath)}.class`
                );
                if (fs.existsSync(javaClassFile)) {
                    try {
                        fs.unlinkSync(javaClassFile);
                    } catch (unlinkErr) {
                        console.error(`Error deleting Java class file (${javaClassFile}):`, unlinkErr.message);
                    }
                }
            }
        }

        // Resolve the promise with the final results
        resolve({ output, error, time, memory });
    });
};

function filenameWithoutExt(filepath) {
    return path.basename(filepath, path.extname(filepath));
}

module.exports = { executeCpp };