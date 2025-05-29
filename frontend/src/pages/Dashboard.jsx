// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate for navigation
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import Badge from '../components/UI/Badge';
import { FaCheckCircle, FaAward, FaChartLine, FaBolt, FaClock } from 'react-icons/fa'; // For icons

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
    loading: true,
    error: null,
  });

  useEffect(() => {
    // Simulate fetching data from an API
    const fetchDashboardData = async () => {
      setDashboardData((prev) => ({ ...prev, loading: true, error: null })); // Set loading state

      try {
        // Simulate network delay
        await new Promise((resolve) => setTimeout(resolve, 1500));

        // Simulated Data (replace with actual API response later)
        const simulatedData = {
          userName: 'John Doe',
          problemsSolved: 127,
          solvedChange: '+12 this week',
          currentRank: '#2,456',
          rankChange: '+145 this month',
          successRate: '78%',
          successRateChange: '+3% improvement',
          streak: '15 days',
          recentSubmissions: [
            { id: 1, title: 'Two Sum', time: '2 hours ago', difficulty: 'easy', status: 'accepted' },
            { id: 2, title: 'Binary Search', time: '5 hours ago', difficulty: 'medium', status: 'wrong-answer' },
            { id: 3, title: 'Merge Sort', time: '1 day ago', difficulty: 'hard', status: 'accepted' },
            { id: 4, title: 'Longest Palindromic Substring', time: '2 days ago', difficulty: 'medium', status: 'accepted' },
          ],
          upcomingContests: [
            { id: 1, name: 'Weekly Contest 123', time: 'Tomorrow 8:00 PM', participants: '2500 participants' },
            { id: 2, name: 'Monthly Challenge', time: 'Next Week', participants: '5000 participants' },
            { id: 3, name: 'Algo Marathon', time: 'June 15, 2025', participants: '1200 participants' },
          ],
        };

        setDashboardData((prev) => ({ ...prev, ...simulatedData, loading: false }));
      } catch (err) {
        setDashboardData((prev) => ({ ...prev, loading: false, error: 'Failed to load dashboard data.' }));
        console.error('Error fetching dashboard data:', err);
      }
    };

    fetchDashboardData();
  }, []); // Empty dependency array means this runs once on component mount

  if (dashboardData.loading) {
    return (
      <div className="flex justify-center items-center h-full text-gray-400 text-lg">
        Loading dashboard data...
      </div>
    );
  }

  if (dashboardData.error) {
    return (
      <div className="flex justify-center items-center h-full text-red-500 text-lg">
        Error: {dashboardData.error}
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-100">Welcome back, {dashboardData.userName}!</h1>
      <p className="text-gray-400 mb-8">Ready to solve some problems today?</p>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="flex flex-col items-start">
          <div className="flex items-center mb-2">
            <FaCheckCircle className="text-green-500 mr-2 text-xl" />
            <h3 className="text-lg font-semibold text-gray-200">Problems Solved</h3>
          </div>
          <p className="text-3xl font-bold text-white">{dashboardData.problemsSolved}</p>
          <p className="text-sm text-green-400">{dashboardData.solvedChange}</p>
        </Card>

        <Card className="flex flex-col items-start">
          <div className="flex items-center mb-2">
            <FaAward className="text-yellow-400 mr-2 text-xl" />
            <h3 className="text-lg font-semibold text-gray-200">Current Rank</h3>
          </div>
          <p className="text-3xl font-bold text-white">{dashboardData.currentRank}</p>
          <p className="text-sm text-green-400">{dashboardData.rankChange}</p>
        </Card>

        <Card className="flex flex-col items-start">
          <div className="flex items-center mb-2">
            <FaChartLine className="text-blue-400 mr-2 text-xl" />
            <h3 className="text-lg font-semibold text-gray-200">Success Rate</h3>
          </div>
          <p className="text-3xl font-bold text-white">{dashboardData.successRate}</p>
          <p className="text-sm text-green-400">{dashboardData.successRateChange}</p>
        </Card>

        <Card className="flex flex-col items-start">
          <div className="flex items-center mb-2">
            <FaBolt className="text-purple-400 mr-2 text-xl" />
            <h3 className="text-lg font-semibold text-gray-200">Streak</h3>
          </div>
          <p className="text-3xl font-bold text-white">{dashboardData.streak}</p>
          <p className="text-sm text-gray-400">Keep it up!</p>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Submissions Card */}
        <Card className="lg:col-span-2">
          <h2 className="text-xl font-bold mb-4 text-gray-100">Recent Submissions</h2>
          <div className="space-y-4">
            {dashboardData.recentSubmissions.length > 0 ? (
              dashboardData.recentSubmissions.map((submission) => (
                <div key={submission.id} className="flex items-center justify-between p-3 bg-gray-700 rounded-md">
                  <div>
                    <h4 className="font-semibold text-white">{submission.title}</h4>
                    <p className="text-sm text-gray-400">{submission.time}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={submission.difficulty}>{submission.difficulty.charAt(0).toUpperCase() + submission.difficulty.slice(1)}</Badge>
                    <Badge variant={submission.status}>{submission.status.charAt(0).toUpperCase() + submission.status.slice(1)}</Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No recent submissions found.</p>
            )}
          </div>
          <Button
            variant="secondary"
            className="mt-6 w-full"
            onClick={() => navigate('/submissions')} // Navigate to submissions page
          >
            View All Submissions
          </Button>
        </Card>

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
            onClick={() => alert('Simulating contest registration!')} // Placeholder for registration
          >
            Register for Contest
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;