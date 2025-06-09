// frontend/src/pages/ViewSubmission.jsx
import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { FaSpinner, FaExclamationCircle, FaCheckCircle, FaTimesCircle, FaHourglassHalf } from 'react-icons/fa';

const ViewSubmission = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [submission, setSubmission] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

  useEffect(() => {
    const fetchSubmission = async () => {
      try {
        setLoading(true);
        setError('');
        const token = localStorage.getItem('token');
        if (!token) {
          navigate('/login?message=unauthorized');
          return;
        }

        const res = await axios.get(`${API_BASE_URL}/api/submissions/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setSubmission(res.data);
      } catch (err) {
        console.error('Error fetching submission:', err);
        if (axios.isAxiosError(err) && err.response) {
          if (err.response.status === 401 || err.response.status === 403) {
            navigate('/login?message=unauthorized');
          } else if (err.response.status === 404) {
            setError('Submission not found.');
          } else {
            setError(err.response.data.message || 'Failed to load submission details. Please try again.');
          }
        } else {
          setError('Network error or unexpected issue. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSubmission();
  }, [id, navigate, API_BASE_URL]);

  const renderStatusIcon = (statusText) => {
    switch (statusText) {
      case 'Accepted':
        return <FaCheckCircle className="text-green-500 mr-2" />;
      case 'Wrong Answer':
        return <FaTimesCircle className="text-red-500 mr-2" />;
      case 'Time Limit Exceeded':
      case 'Memory Limit Exceeded':
      case 'Runtime Error':
        return <FaExclamationCircle className="text-yellow-500 mr-2" />;
      case 'Compilation Error':
      case 'Error':
        return <FaExclamationCircle className="text-orange-500 mr-2" />;
      case 'Pending':
        return <FaHourglassHalf className="animate-pulse text-blue-400 mr-2" />;
      case 'Running':
        return <FaSpinner className="animate-spin text-blue-500 mr-2" />;
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full min-h-[50vh]">
        <FaSpinner className="animate-spin text-4xl text-blue-500" />
        <p className="ml-3 text-lg text-gray-300">Loading Submission Details...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 text-center text-lg mt-10 p-4 bg-gray-800 rounded-lg shadow-xl mx-auto max-w-lg">
        <FaExclamationCircle className="inline-block mr-2 text-2xl" /> {error}
      </div>
    );
  }

  if (!submission) {
    return <div className="text-gray-400 text-center text-lg mt-10 p-4 bg-gray-800 rounded-lg shadow-xl mx-auto max-w-lg">No submission data found.</div>;
  }

  return (
    <div className="p-6 bg-gray-800 rounded-lg shadow-xl text-gray-200">
      <h1 className="text-3xl font-bold mb-6 border-b border-gray-700 pb-4">Submission Details</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div>
          <p className="text-lg font-semibold mb-2">Problem:</p>
          {submission.problem ? (
            <>
              <Link to={`/problems/${submission.problem._id}`} className="text-blue-400 hover:underline text-xl">
                {submission.problem.title || 'Problem Title Not Available'}
              </Link>
              {submission.problem.description && (
                <p className="text-sm text-gray-400 mt-1">
                  {submission.problem.description.substring(0, 100)}{submission.problem.description.length > 100 ? '...' : ''}
                </p>
              )}
            </>
          ) : (
            <p className="text-xl text-gray-400">Problem Details Not Found or Not Linked</p>
          )}
        </div>
        <div>
          <p className="text-lg font-semibold mb-2">Language:</p>
          <p className="text-xl">{submission.language}</p>
        </div>
        <div>
          <p className="text-lg font-semibold mb-2">Overall Verdict:</p>
          <p className="text-xl flex items-center">
            {renderStatusIcon(submission.verdict)} {submission.verdict}
          </p>
        </div>
        <div>
          <p className="text-lg font-semibold mb-2">Submitted At:</p>
          <p className="text-xl">{new Date(submission.submittedAt).toLocaleString()}</p>
        </div>
        {submission.runtime !== null && submission.runtime !== undefined && (
          <div>
            <p className="text-lg font-semibold mb-2">Runtime:</p>
            <p className="text-xl">{submission.runtime} ms</p>
          </div>
        )}
        {submission.memory !== null && submission.memory !== undefined && (
          <div>
            <p className="text-lg font-semibold mb-2">Memory:</p>
            <p className="text-xl">{submission.memory} KB</p>
          </div>
        )}
      </div>

      <div className="mb-8">
        <p className="text-lg font-semibold mb-2">Submitted Code:</p>
        <div className="bg-gray-900 p-4 rounded-md overflow-x-auto font-mono text-sm">
          <pre className="whitespace-pre-wrap">{submission.code}</pre>
        </div>
      </div>

      {/* Display error message if present */}
      {submission.errorMessage && (
        <div className="mb-8">
          <p className="text-lg font-semibold mb-2 text-red-400">Error Message:</p>
          <div className="bg-red-900/30 p-4 rounded-md overflow-x-auto font-mono text-sm text-red-300">
            <pre className="whitespace-pre-wrap">{submission.errorMessage}</pre>
          </div>
        </div>
      )}

      {/* The 'Test Case Results' section has been removed as per your request. */}
      {/* If you wish to re-add it later, you can refer to previous versions of the code. */}

    </div>
  );
};

export default ViewSubmission;