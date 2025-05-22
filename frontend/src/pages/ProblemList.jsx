import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";

export default function ProblemList() {
  const [problems, setproblems] = useState([]);

  useEffect(() => {
    const fetchProblems = async () => {
      const res = await fetch("http://localhost:5000/api/problems");
      const data = await res.json();
      setproblems(data);
    };

    fetchProblems();
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Do you want to delete the problem?")) return;
    try {
      const res = await fetch(`http://localhost:5000/api/problems/${id}`, {
        method: "DELETE",
      });

      if (res.ok)
        setproblems((prev) => prev.filter((problem) => problem._id !== id));
      else alert("failed to delete problem");
    } catch (err) {
      console.error("Error deleting problem", err);
      alert("Error occurred");
    }
  };

  return (
    <div>
      <h2>All Problems</h2>
      <ul>
        {problems.map((problem) => (
          <li key={problem._id}>
            <Link to={`/problems/${problem._id}`}>
              <strong> {problem.title}</strong>
            </Link>
            {" | "}
            <Link
              to={`/problems/${problem._id}/edit`}
              style={{ color: "orange" }}
            >
              Edit
            </Link>
            {" | "}
            <button
              style={{
                color: "red",
                cursor: "pointer",
                background: "none",
                border: "none",
              }}
              onClick={() => handleDelete(problem._id)}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
