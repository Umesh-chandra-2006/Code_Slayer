import React, { useState } from "react";

export default function CodeEditor() {
  const [code, setcode] = useState("");
  const [output, setoutput] = useState("");
  const [loading, setloading] = useState(false);
  const [error, seterror] = useState("");

  const handleCode = async (e) => {
    e.preventDefault();
    setloading(true);
    setoutput("");
    seterror("");

    try {
      const res = await fetch("http://localhost:5000/api/compiler/run", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: code }),
      });

      const data = res.json();
      if (res.ok) setoutput(data.output);
      else seterror(data?.error?.stderr || data?.error || "Execution error");
    } catch (err) {
      seterror("Server error");
    }
    setloading(false);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Online Compiler</h2>
      <form onSubmit={handleCode}>
        <textarea
          rows="12"
          cols="80"
          value={code}
          onChange={(e) => setcode(e.target.value)}
          placeholder="// Write your Code here"
          required
        ></textarea>
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
