// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { FaCheckCircle, FaAward, FaChartLine, FaBolt, FaClock } from 'react-icons/fa';
import { motion } from 'framer-motion';

const Dashboard = () => {
  const navigate = useNavigate();

  const [dashboardData, setDashboardData] = useState({
    userName: 'Loading...', // This will be set from localStorage or API
    problemsSolved: 0,
    solvedChange: '0',
    currentRank: 'Loading...',
    rankChange: '0',
    successRate: '0%',
    successRateChange: '0%',
    streak: '0 days',
    recentSubmissions: [],
    upcomingContests: [], // Keeping for future use as per your list
    loading: true,
    error: null,
  });

  // Make fetchDashboardData a standalone function so it can be called by a retry button
  const fetchDashboardData = async () => {
    setDashboardData((prev) => ({ ...prev, loading: true, error: null })); // Set loading state

    try {
      const token = localStorage.getItem('token');
      const storedUserName = localStorage.getItem('username'); // Get username from local storage
      const userId = localStorage.getItem('userId'); // Assuming your backend needs userId for personalized dashboard data

      if (!token || !userId) {
        setDashboardData((prev) => ({
          ...prev,
          error: "User not authenticated. Please log in.",
          loading: false,
          userName: storedUserName || 'Guest',
        }));
        // Optional: uncomment if you want to redirect to login if token is missing here
        // navigate('/login');
        return;
      }

      // Set initial userName from localStorage, will be updated by API if provided
      setDashboardData((prev) => ({ ...prev, userName: storedUserName || 'User' }));

      const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:5000";

      // --- ACTUAL API CALL ---
      const response = await fetch(`${API_BASE_URL}/api/dashboard/${userId}`, { // Example: A dedicated dashboard endpoint
        headers: {
          'Authorization': `Bearer ${token}`, // Send JWT for authentication/authorization to access data
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `Error: ${response.statusText}`);
      }

      const actualData = await response.json();
      // Assuming actualData from backend looks like:
      // {
      //   userName: 'John Doe',
      //   problemsSolved: 125,
      //   solvedChange: '+15',
      //   currentRank: 'Elite Coder',
      //   rankChange: '+5',
      //   successRate: '85%',
      //   successRateChange: '+2%',
      //   streak: '7 days',
      //   recentSubmissions: [...]
      // }

      setDashboardData((prev) => ({
        ...prev,
        ...actualData, // Merge actual data from API response
        loading: false,
        userName: actualData.userName || storedUserName || 'User', // Prioritize API's userName, fall back to localStorage
      }));
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setDashboardData((prev) => ({
        ...prev,
        error: err.message || "Failed to load dashboard data. Please try again.",
        loading: false, // Corrected: only one 'loading: false'
        userName: localStorage.getItem('username') || 'Error Loading User',
      }));
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []); // Run once on mount

  const dashboardVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1, // Stagger animation of child elements
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { type: "spring", stiffness: 100 } },
  };

  // Helper function to get badge variant for submission status
  const getStatusBadgeVariant = (status) => {
    switch (status) {
      case 'accepted':
        return 'accepted';
      case 'wrong-answer':
        return 'wrong-answer';
      case 'pending':
        return 'default'; // Or define a specific pending variant in Badge.jsx
      default:
        return 'default';
    }
  };

  // Helper function to get color for change indicators
  const getChangeIndicator = (change) => {
    if (change.startsWith('+')) {
      return 'text-green-400';
    } else if (change.startsWith('-')) {
      return 'text-red-400';
    }
    return 'text-gray-400';
  };
  // ... (rest of your component: getStatusBadgeVariant, getChangeIndicator, dashboardVariants, itemVariants)

  return (
    <div className="p-6 md:p-8 lg:p-10">
      <motion.h1
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-4xl font-extrabold text-white mb-8"
      >
        Welcome, {dashboardData.userName}!
      </motion.h1>

      {/* Conditional rendering for loading/error states */}
      {dashboardData.loading && (
        <p className="text-blue-400 text-lg text-center">Loading dashboard...</p>
      )}
      {dashboardData.error && (
        <div className="text-center mt-8">
          <p className="text-red-400 text-lg mb-4">{dashboardData.error}</p>
          {/* Add a retry button for errors */}
          <Button
            onClick={fetchDashboardData} // Call the fetch function to retry
            variant="danger"
            disabled={dashboardData.loading} // Disable while loading
          >
            {dashboardData.loading ? 'Retrying...' : 'Retry Loading Dashboard'}
          </Button>
        </div>
      )}

      {!dashboardData.loading && !dashboardData.error && (
        <motion.div
          variants={dashboardVariants}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8"
        >
          {/* ... Your existing Card components and content ... */}
          {/* Key Metrics Section */}
          <motion.div variants={itemVariants} className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
            <Card>
              <FaCheckCircle className="text-blue-400 text-3xl mb-3" />
              <h3 className="text-lg font-semibold text-gray-200">Problems Solved</h3>
              <p className="text-3xl font-bold text-white mt-1">
                {dashboardData.problemsSolved}
              </p>
              <p className={`text-sm ${getChangeIndicator(dashboardData.solvedChange)}`}>
                {dashboardData.solvedChange} from last month
              </p>
            </Card>

            <Card>
              <FaAward className="text-purple-400 text-3xl mb-3" />
              <h3 className="text-lg font-semibold text-gray-200">Current Rank</h3>
              <p className="text-3xl font-bold text-white mt-1">
                {dashboardData.currentRank}
              </p>
              <p className={`text-sm ${getChangeIndicator(dashboardData.rankChange)}`}>
                {dashboardData.rankChange} in global ranking
              </p>
            </Card>

            <Card>
              <FaChartLine className="text-green-400 text-3xl mb-3" />
              <h3 className="text-lg font-semibold text-gray-200">Success Rate</h3>
              <p className="text-3xl font-bold text-white mt-1">
                {dashboardData.successRate}
              </p>
              <p className={`text-sm ${getChangeIndicator(dashboardData.successRateChange)}`}>
                {dashboardData.successRateChange} from last week
              </p>
            </Card>

            <Card>
              <FaBolt className="text-yellow-400 text-3xl mb-3" />
              <h3 className="text-lg font-semibold text-gray-200">Current Streak</h3>
              <p className="text-3xl font-bold text-white mt-1">
                {dashboardData.streak}
              </p>
              <p className="text-sm text-gray-400">Keep up the good work!</p>
            </Card>
          </motion.div>

          {/* Recent Submissions Card */}
          <motion.div variants={itemVariants} className="lg:col-span-1">
            <Card>
              <h2 className="text-xl font-bold mb-4 text-gray-100">Recent Submissions</h2>
              <div className="space-y-4">
                {dashboardData.recentSubmissions.length > 0 ? (
                  dashboardData.recentSubmissions.map((sub) => (
                    <div key={sub.id} className="p-3 bg-gray-700 rounded-md flex justify-between items-center">
                      <div>
                        <h4 className="font-semibold text-white">{sub.problemName}</h4>
                        <p className="text-sm text-gray-400">{sub.language}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={getStatusBadgeVariant(sub.status)}>
                          {sub.status}
                        </Badge>
                        <span className="text-xs text-gray-500">{sub.time}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-gray-400">No recent submissions.</p>
                )}
              </div>
              <Button
                variant="secondary"
                className="mt-6 w-full"
                onClick={() => navigate('/submissions')}
              >
                View All Submissions
              </Button>
            </Card>
          </motion.div>

          {/* Upcoming Contests Card */}
          <Card className="lg:col-span-1">
            <h2 className="text-xl font-bold mb-4 text-gray-100">Upcoming Contests</h2>
            <div className="space-y-4">
              {dashboardData.upcomingContests.length > 0 ? (
                dashboardData.upcomingContests.map((contest) => (
                  <div key={contest.id} className="p-3 bg-gray-700 rounded-md">
                    <h4 className="font-semibold text-white">{contest.name}</h4>
                    <p className="text-sm text-gray-400 flex items-center">
                      <FaClock className="mr-1 text-xs" />{contest.time}
                    </p>
                    <p className="text-sm text-gray-400">{contest.participants}</p>
                  </div>
                ))
              ) : (
                <p className="text-gray-400">No upcoming contests.</p>
              )}
            </div>
            <Button
              variant="primary"
              className="mt-6 w-full bg-purple-600 hover:bg-purple-700"
              onClick={() => alert('Future: Integrate contest registration!')} // Updated placeholder
            >
              Register for Contest
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
};

export default Dashboard;