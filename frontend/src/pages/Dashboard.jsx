// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { FaCheckCircle, FaAward, FaChartLine, FaBolt, FaClock, FaFire } from 'react-icons/fa'; // FaCode removed

const Dashboard = () => {
  const navigate = useNavigate(); // Initialize navigate hook

  // State to hold dynamic dashboard data
  const [dashboardData, setDashboardData] = useState({
    userName: 'Loading...',
    problemsSolved: 0,
    solvedChange: '0',
    currentRank: 'Loading...',
    rankChange: '0',
    successRate: '0%',
    successRateChange: '0%',
    streak: '0 days',
    recentSubmissions: [],
    upcomingContests: [],
    // languageStats: {}, // Removed
    solvedByDifficulty: { Easy: 0, Medium: 0, Hard: 0 }, // Initialize new field
    loading: true,
    error: null,
  });
  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


  useEffect(() => {
    const fetchDashboardData = async () => {
      setDashboardData((prev) => ({ ...prev, loading: true, error: null })); // Set loading state

      try {
        const token = localStorage.getItem("token");
        const userId = localStorage.getItem("userId");

        if (!token || !userId) {
          throw new Error("Authentication token or User ID not found. Please log in.");
        }

        const response = await fetch(`${API_BASE_URL}/api/dashboard/${userId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `Error: ${response.statusText}`);
        }

        const data = await response.json();
        setDashboardData((prev) => ({ ...prev, ...data, loading: false }));

      } catch (err) {
        console.error("Error fetching dashboard data:", err);
        setDashboardData((prev) => ({
          ...prev,
          loading: false,
          error: err.message || "Failed to load dashboard data. Please try again.",
        }));
      }
    };

    fetchDashboardData();
  }, []);

  // Helper to determine badge variant for recent submissions (using existing Badge component logic)
  const getStatusBadgeVariant = (status) => {
    switch (status && status.toLowerCase()) {
      case 'accepted':
        return 'accepted'; // Maps to green
      case 'wrong answer':
      case 'time limit exceeded':
      case 'runtime error':
      case 'compilation error':
      case 'error':
        return 'wrong-answer'; // Maps to red
      case 'pending':
      default:
        return 'default'; // Maps to gray
    }
  };

  if (dashboardData.loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Card key={i} className="animate-pulse">
              <div className="h-4 bg-gray-700 rounded w-3/4 mb-4"></div>
              <div className="h-8 bg-gray-600 rounded w-1/2"></div>
              <div className="h-4 bg-gray-700 rounded w-1/4 mt-4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="p-6 text-center text-red-400">
        <h1 className="text-3xl font-bold mb-6 text-gray-100">Dashboard</h1>
        <p className="bg-red-500/20 p-4 rounded-lg border border-red-500">
          Error: {dashboardData.error}
        </p>
        <Button onClick={() => window.location.reload()} className="mt-4">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">
        Welcome, {dashboardData.userName}!
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {/* Problems Solved Card */}
        <Card>
          <div className="flex items-center mb-3">
            <FaCheckCircle className="text-blue-400 text-2xl mr-3" />
            <h2 className="text-xl font-bold text-gray-100">Problems Solved</h2>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {dashboardData.problemsSolved}
          </p>
          
        </Card>

        {/* Success Rate Card */}
        <Card>
          <div className="flex items-center mb-3">
            <FaChartLine className="text-teal-400 text-2xl mr-3" />
            <h2 className="text-xl font-bold text-gray-100">Success Rate</h2>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {dashboardData.successRate}
          </p>
         
        </Card>

        {/* Current Streak Card */}
        <Card>
          <div className="flex items-center mb-3">
            <FaFire className="text-orange-400 text-2xl mr-3" />
            <h2 className="text-xl font-bold text-gray-100">Current Streak</h2>
          </div>
          <p className="text-5xl font-extrabold text-white mb-2">
            {dashboardData.streak}
          </p>
          <p className="text-sm text-gray-400">Keep up the great work!</p>
        </Card>

        {/* Problems Solved by Difficulty Card (NEW) */}
        <Card>
          <div className="flex items-center mb-3">
            <FaAward className="text-purple-400 text-2xl mr-3" />
            <h2 className="text-xl font-bold text-gray-100">Difficulty Breakdown</h2>
          </div>
          <div className="space-y-2 text-white">
            <p>Easy: <span className="font-semibold text-green-400">{dashboardData.solvedByDifficulty.Easy}</span></p>
            <p>Medium: <span className="font-semibold text-yellow-400">{dashboardData.solvedByDifficulty.Medium}</span></p>
            <p>Hard: <span className="font-semibold text-red-400">{dashboardData.solvedByDifficulty.Hard}</span></p>
          </div>
        </Card>

        {/* Recent Submissions Card */}
        {/* Adjusted col-span as Language Usage card is removed */}
        <Card className="lg:col-span-2 md:col-span-2"> 
          <h2 className="text-xl font-bold mb-4 text-gray-100">Recent Submissions</h2>
          <div className="space-y-4">
            {dashboardData.recentSubmissions.length > 0 ? (
              dashboardData.recentSubmissions.map((sub) => (
                <div key={sub.id} className="p-3 bg-gray-700 rounded-md">
                  <h4 className="font-semibold text-white">
                    {sub.problemName} ({sub.difficulty})
                  </h4>
                  <div className="flex items-center space-x-2 mt-1 text-sm">
                    <Badge variant={getStatusBadgeVariant(sub.status)}>
                      {sub.status}
                    </Badge>
                    <span className="text-gray-400">{sub.language}</span>
                    <span className="text-gray-500">• {sub.time}</span>
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

        {/* Upcoming Contests Card */}
        <Card className="lg:col-span-1 md:col-span-2"> {/* Adjusted col-span to take remaining space */}
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
            onClick={() => alert('Simulating contest registration!')} // Placeholder for registration
          >
            Find Contests
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;