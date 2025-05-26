import React, { useEffect, useState } from "react";

const SubmissionHistory = () => {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const userId = localStorage.getItem("userId");

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch(`http://localhost:5000/api/submissions/user/${userId}`);
        const data = await response.json();
        setSubmissions(data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching submissions:", error);
        setLoading(false);
      }
    };

    if (userId) {
      fetchSubmissions();
    } else {
      setLoading(false);
    }
  }, [userId]);

  if (loading) return <p>Loading...</p>;

  if (!submissions.length) return <p>No submissions found.</p>;

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <h2 className="text-2xl font-bold mb-4">Submission History</h2>
      <table className="w-full border-collapse border border-gray-400">
        <thead className="bg-gray-200">
          <tr>
            <th className="p-2 border">#</th>
            <th className="p-2 border">Problem</th>
            <th className="p-2 border">Language</th>
            <th className="p-2 border">Status</th>
            <th className="p-2 border">Submitted</th>
          </tr>
        </thead>
        <tbody>
          {submissions.map((sub, index) => (
            <tr key={sub._id} className="text-center">
              <td className="p-2 border">{index + 1}</td>
              <td className="p-2 border">{sub.problem?.title || "Deleted"}</td>
              <td className="p-2 border">{sub.language}</td>
              <td
                className={`p-2 border font-semibold ${
                  sub.status === "accepted" ? "text-green-600" : "text-red-600"
                }`}
              >
                {sub.status}
              </td>
              <td className="p-2 border">{new Date(sub.createdAt).toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default SubmissionHistory;
