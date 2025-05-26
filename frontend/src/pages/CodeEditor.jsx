import React, { useState, useEffect } from "react";

export default function CodeEditor({
  initialCode = "",
  initialInput = "",
  initialLanguage = "",
  hideInputBox = false,
  userId = "",
  problemId = "",
}) {
  const [code, setCode] = useState(initialCode);
  const [input, setInput] = useState(initialInput);
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState(initialLanguage || "cpp");

  useEffect(() => {
    setCode(initialCode);
    setInput(initialInput);
    setLanguage(initialLanguage || "cpp");
  }, [initialCode, initialInput, initialLanguage]);

  const handleCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language, code, input }),
      });

      const data = await res.json();
      if (res.ok) setOutput(data.output);
      else setError(data?.error || "Execution failed");
    } catch (err) {
      setError("Server error");
    }
    setLoading(false);
  };

  const handleTestAllCases = async () => {
    setLoading(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/compiler/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code, language, problemId }),
      });

      const data = await res.json();
      if (res.ok) {
        const report = data.results
          .map(
            (r, i) =>
              `Test #${i + 1}: ${
                r.passed ? "✅ Passed" : "❌ Failed"
              }\nInput:\n${r.input}\nExpected:\n${r.expected}\nGot:\n${
                r.actual
              }`
          )
          .join("\n\n");
        setOutput(report);
      } else {
        setError(data.error || "Test failed");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  const handleSubmit = async () => {
    if (!code || !language) {
      alert("Code or language missing");
      return;
    }

    if (!userId || !problemId) {
      alert("User or problem not specified");
      return;
    }

    setLoading(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, problemId, code, language }),
      });

      const data = await res.json();

      if (res.ok) {
        setOutput(
          `✅ ${data.status.toUpperCase()}\n\nExpected Output:\n${
            data.expected
          }\n\nYour Output:\n${data.output}`
        );
      } else {
        setError(data.error || "Submission failed.");
      }
    } catch (err) {
      setError("Server error");
    }

    setLoading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Online Compiler</h2>
      <form onSubmit={handleCode}>
        <label>
          Language:
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
          >
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>
        </label>
        <br />
        <br />

        <label>
          Code:
          <br />
          <textarea
            rows="12"
            cols="80"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="// Write your C++ code here"
            required
          />
        </label>
        <br />

        {!hideInputBox && (
          <>
            <label>
              Input (optional):
              <br />
              <textarea
                rows="6"
                cols="80"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="// Provide input for the code"
              />
            </label>
            <br />
          </>
        )}

        <br />
        <button type="submit" disabled={loading}>
          {loading ? "Running.. " : "Run Code"}
        </button>

        <br />

        <button type="button" disabled={loading} onClick={handleTestAllCases}>
          {loading ? "Testing..." : "Test All Cases"}
        </button>
        <br />

        <button type="button" disabled={loading} onClick={handleSubmit}>
          {loading ? "Submitting..." : "Submit Solution"}
        </button>
      </form>

      {output && (
        <div style={{ marginTop: "20px", color: "green" }}>
          <h4>Output:</h4>
          <pre>{output}</pre>
        </div>
      )}

      {error && (
        <div style={{ marginTop: "20px", color: "red" }}>
          <h4>Error:</h4>
          <pre>{error}</pre>
        </div>
      )}
    </div>
  );
}
