import React, { useState } from "react";

export default function CodeEditor() {
  const [code, setCode] = useState("");
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [language, setLanguage] = useState("cpp");

  const handleCode = async (e) => {
    e.preventDefault();
    setLoading(true);
    setOutput("");
    setError("");

    try {
      const res = await fetch("http://localhost:5000/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ language: language, code: code, input: input }),
      });

      const data = await res.json();
      if (res.ok) setOutput(data.output);
      else setError(data?.error || "Execution failed");
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
          <select value={language} onChange={(e) => setLanguage(e.target.value)}>
            <option value="cpp">C++</option>
            <option value="python">Python</option>
            <option value="javascript">JavaScript</option>
            <option value="java">Java</option>
          </select>
        </label>
        <br /><br />
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
        <button type="submit" disabled={loading}>
          {loading ? "Running.. " : "Run Code"}
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
