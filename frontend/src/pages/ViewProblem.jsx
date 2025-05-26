import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import CodeEditor from "./CodeEditor";

export default function ViewProblem() {
  const { id } = useParams();
  const [problem, setproblem] = useState(null);
  const loggedInUserId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchProblems = async () => {
      try {
        const res = await fetch(`http://localhost:5000/api/problems/${id}`);
        if (!res.ok) throw new Error("Failed to fetch problem");
        const data = await res.json();
        setproblem(data);
      } catch (err) {
        console.error("Error fetching problem:", err);
        setproblem(null);
      }
    };

    fetchProblems();
  }, [id]);

  if (!problem) return  <p>Loading problem or problem not found.</p>;


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
      <CodeEditor
        initialCode={`#include <iostream>\nusing namespace std;\nint main() {\n  // your code\n  return 0;\n}`}
        initialInput={problem.sampleInput || ""}
        initialLanguage="cpp"
        hideInputBox={true}
        userId={loggedInUserId}
        problemId={problem._id || id}
        testInput={problem.sampleInput}
      />
    </div>
  );
}
