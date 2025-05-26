import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function NewProblem() {
  const navigate = useNavigate();
  const [form, setform] = useState({
    title: "",
    description: "",
    inputFormat: "",
    outputFormat: "",
    sampleInput: "",
    sampleOutput: "",
    constraints: "",
    difficulty: "Easy",
    testCases: [{ input: "", output: "" }],
  });

  const handleChange = (e) => {
    setform((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:5000/api/problems", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) navigate("/problems");
      else alert("Failed to create problem");
    } catch (err) {
      console.error("Error creating problem:", err);
    }
  };

  return (
    <div>
      <h2> Create new Problem</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title:</label> <br />
          <input
            name="title"
            value={form.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Description:</label> <br />
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            required
            rows={6}
          />
        </div>
        <div>
          <label>Diffculty:</label> <br />
          <select
            name="difficulty"
            value={form.difficulty}
            onChange={handleChange}
          >
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>
        <div>
          <label>Input Format:</label> <br />
          <textarea
            name="inputFormat"
            value={form.inputFormat}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>
        <div>
          <label>Output Format:</label> <br />
          <textarea
            name="outputFormat"
            value={form.outputFormat}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>
        <div>
          <label>Sample Input:</label> <br />
          <textarea
            name="sampleInput"
            value={form.sampleInput}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>
        <div>
          <label>Input Format:</label> <br />
          <textarea
            name="sampleOutput"
            value={form.sampleOutput}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>
        <div>
          <label>Constraints:</label> <br />
          <textarea
            name="constraints"
            value={form.constraints}
            onChange={handleChange}
            required
            rows={4}
          />
        </div>
        <div>
          <label>Test Cases:</label>
          <br />
          {form.testCases.map((tc, idx) => (
            <div key={idx} style={{ marginBottom: "10px" }}>
              <textarea
                placeholder="Input"
                rows={2}
                value={tc.input}
                onChange={(e) => {
                  const newTC = [...form.testCases];
                  newTC[idx].input = e.target.value;
                  setform({ ...form, testCases: newTC });
                }}
              />
              <textarea
                placeholder="Expected Output"
                rows={2}
                value={tc.output}
                onChange={(e) => {
                  const newTC = [...form.testCases];
                  newTC[idx].output = e.target.value;
                  setform({ ...form, testCases: newTC });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const newTC = form.testCases.filter((_, i) => i !== idx);
                  setform({ ...form, testCases: newTC });
                }}
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setform({
                ...form,
                testCases: [...form.testCases, { input: "", output: "" }],
              })
            }
          >
            Add Test Case
          </button>
        </div>

        <button type="submit">Create </button>
      </form>
    </div>
  );
}
