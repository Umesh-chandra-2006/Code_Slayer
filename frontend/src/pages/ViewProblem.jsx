import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function ViewProblem() {
  const { id } = useParams();
  const [problem, setproblem] = useState(null);
  const [code,setCode] = useState("");

  useEffect(() => {
    const fetchProblems = async () => {
      const res = await fetch(`http://localhost:5000/api/problems/${id}`);
      const data = await res.json();
      setproblem(data);
    };

    fetchProblems();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const res = await fetch("http://localhost:5000/api/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemId: id, code }),
      });

      const result = await res.json();
      console.log("Result:", result);
    } catch (err) {
      console.error("Submission failed", err);
    }
  };

  if (!problem) return <p>Loading...</p>;

  return (
    <div>
      <h2>{problem.title}</h2>
      <p>
        <strong>Description:</strong> {problem.description}
      </p>
      <p>
        <strong>Input Format:</strong> {problem.inputFormat}
      </p>
      <p>
        <strong>Output Format:</strong> {problem.outputFormat}
      </p>
      <p>
        <strong>Sample Input:</strong> {problem.sampleInput}
      </p>
      <p>
        <strong>Sample Output:</strong> {problem.sampleOutput}
      </p>

      <h3> Submit </h3>
      <textarea
        rows="10"
        cols="80"
        placeholder="Write your code here..."
        value={code}
        onChange={(e) => setCode(e.target.value)}
      />
      <br />
      <button onClick={handleSubmit}> Submit</button>
    </div>
  );
}
