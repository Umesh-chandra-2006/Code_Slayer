const { GoogleGenAI } = require("@google/genai");
const dotenv = require("dotenv");

dotenv.config();

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_API_KEY });

const aiCodeReview = async (req, res) => {
  const {
    code,
    language,
    problemDescription,
    submissionVerdict,
    compilationError,
    runtimeError,
    failedTestInput,
  } = req.body;

  if (!code || !language || !problemDescription || !submissionVerdict) {
    return res
      .status(400)
      .json({ message: "Missing required parameters for AI review." });
  }

  let prompt = "";

  // --- Scenario 1: Accepted Solution (Optimization/Improvement) ---
  if (submissionVerdict === "Accepted") {
    prompt = `You are an expert code reviewer specializing in competitive programming. A user has submitted a solution for the following problem that passed all test cases. Please analyze their code for potential improvements in terms of:
        1. Readability and clarity.
        2. Efficiency (time and space complexity), suggesting alternative algorithms or data structures if significantly better options exist.
        3. Adherence to general best practices for ${language} in competitive programming.
        4. Conciseness without sacrificing clarity.

        Provide specific, actionable suggestions formatted as a markdown list. If the code is already optimal and clear, state that.

        Problem Description:
        \`\`\`
        ${problemDescription}
        \`\`\`

        User's Code (Language: ${language}):
        \`\`\`${language}
        ${code}
        \`\`\`

        AI Code Review and Suggestions:`;
  }
  // --- Scenario 2 & 3: Rejected / Errors (Hints & Error Diagnosis) ---
  else if (submissionVerdict === "Wrong Answer") {
    prompt = `You are a helpful coding assistant. The user's solution for the following problem resulted in a "Wrong Answer". Provide a small, conceptual hint to guide them towards the correct solution without giving away the answer directly. Focus on common pitfalls, unhandled edge cases, or general algorithmic considerations that might lead to an incorrect output.

        Problem Description:
        \`\`\`
        ${problemDescription}
        \`\`\`

        User's Code (Language: ${language}):
        \`\`\`${language}
        ${code}
        \`\`\`
        ${
          failedTestInput
            ? `The code failed on this input: \`${failedTestInput}\` (use this for context, but don't explicitly mention it in your hint unless necessary for a conceptual clue about input parsing/handling).`
            : ""
        }

        Hint:`;
  } else if (compilationError || runtimeError) {
    const errorType = compilationError ? "Compilation Error" : "Runtime Error";
    const errorMessage = compilationError || runtimeError;

    prompt = `You are an expert debugger. The user's code for the following problem resulted in a ${errorType}. Analyze the provided code and the error message, then explain what the error is, what is causing it, and where it might be occurring in the code. Suggest a potential fix or an area to investigate without rewriting the entire code.

        Problem Description:
        \`\`\`
        ${problemDescription}
        \`\`\`

        User's Code (Language: ${language}):
        \`\`\`${language}
        ${code}
        \`\`\`

        Error Message:
        \`\`\`
        ${errorMessage}
        \`\`\`

        Explanation and Hint:`;
  } else {
    // Fallback for unexpected verdicts
    return res
      .status(400)
      .json({
        message:
          "AI review is only available for accepted, rejected (Wrong Answer), or error-prone submissions.",
      });
  }
  try {
    const result = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: prompt,
    });
    let text = ""; // Fallback message

    if (
      result &&
      result.candidates &&
      result.candidates.length > 0 &&
      result.candidates[0].content &&
      result.candidates[0].content.parts &&
      result.candidates[0].content.parts.length > 0 &&
      result.candidates[0].content.parts[0].text
    ) {
      text = result.candidates[0].content.parts[0].text;
    } else {
      console.warn(
        "Gemini API response did not contain expected text in candidates."
      );
    }
    res.json({ review: text });
  } catch (error) {
    console.error("Error generating AI review:", error);
    let errorMessage = "Failed to get AI review due to an internal error.";
    if (error.response && error.response.status) {
      errorMessage += ` Status: ${error.response.status}`;
      if (error.response.data && error.response.data.message) {
        errorMessage += ` - ${error.response.data.message}`;
      }
    } else if (error.message) {
      errorMessage += ` - ${error.message}`;
    }
    res.status(500).json({ message: errorMessage });
  }
};

module.exports = {
  aiCodeReview,
};
