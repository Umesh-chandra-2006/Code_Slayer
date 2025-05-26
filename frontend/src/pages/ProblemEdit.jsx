import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

export default function ProblemEdit() {
  const { id } = useParams();
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

  useEffect(() => {
    const fetchproblem = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/problems/${id}`);

        if (res.ok) {
          const data = await res.json();
          setform(data);
        } else alert("Failed to fetch problem");
      } catch (err) {
        console.error("Error fetching problem:", err);
      }
    };
    fetchproblem();
  }, [id]);

  const handleChange = (e) => {
    setform((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(`http://localhost:5000/api/problems/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) navigate("/problems");
      else alert("Failed to update problem");
    } catch (err) {
      console.error("Error updating problem:", err);
    }
  };

  return (
    <div>
      <h2> Edit Problem</h2>
      <form onSubmit={handleSubmit}>
        {[
          ["Title", "title"],
          ["Description", "description"],
          ["Input Format", "inputFormat"],
          ["Output Format", "outputFormat"],
          ["Sample Input", "sampleInput"],
          ["Sample Output", "sampleOutput"],
          ["Constraints", "constraints"],
        ].map(([label, name]) => (
          <div key={name}>
            <label>{label}:</label>
            <br />
            <textarea
              name={name}
              value={form[name] || ""}
              onChange={handleChange}
              rows={4}
              required
            />
          </div>
        ))}
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
          <label>Test Cases:</label>
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

        <button type="submit">Update </button>
      </form>
    </div>
  );
}
