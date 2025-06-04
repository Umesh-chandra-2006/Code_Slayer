// src/pages/ProfilePage.jsx

import React, { useEffect, useState, useMemo } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Card from '../components/UI/Card';
import Button from '../components/UI/Button';
import { FaUserCircle, FaEnvelope, FaChartLine, FaFire, FaCode, FaAward, FaCalendarAlt, FaListAlt } from 'react-icons/fa';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';

const ProfilePage = () => {
    const [profileData, setProfileData] = useState({
        userName: '',
        email: '',
        problemsSolved: 0,
        streak: '0 days',
        languageStats: {},
        solvedByDifficulty: { Easy: 0, Medium: 0, Hard: 0 },
        dailySubmissionCounts: {}, // This will store date strings as keys and counts as values
        recentSubmissions: [], // Ensure this is initialized
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;


    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('token');
                const userId = localStorage.getItem('userId');

                if (!token || !userId) {
                    setError('Authentication token or User ID not found. Please log in.');
                    setLoading(false);
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                const { data } = await axios.get(`${API_BASE_URL}/api/dashboard/${userId}?timePeriod=all`, config);
                console.log('Profile data from dashboard endpoint:', data);

                const processedData = {
                    userName: data.userName || 'Guest User',
                    email: data.email || 'N/A',
                    problemsSolved: data.problemsSolved || 0,
                    streak: data.streak || '0 days',
                    languageStats: data.languageStats || {},
                    solvedByDifficulty: { ...profileData.solvedByDifficulty, ...data.solvedByDifficulty }, // Merge to ensure all difficulties are present
                    dailySubmissionCounts: data.dailySubmissionCounts || {},
                    recentSubmissions: data.recentSubmissions || [], // Ensure recent submissions are handled
                };

                setProfileData(processedData);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile. Please try again.');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

    // Data preparation for Recharts - useMemo for performance
    const languageChartData = useMemo(() => {
        return Object.entries(profileData.languageStats).map(([name, value]) => ({
            name,
            value,
        }));
    }, [profileData.languageStats]);

    const difficultyChartData = useMemo(() => {
        return [
            { name: 'Easy', value: profileData.solvedByDifficulty.Easy || 0 },
            { name: 'Medium', value: profileData.solvedByDifficulty.Medium || 0 },
            { name: 'Hard', value: profileData.solvedByDifficulty.Hard || 0 },
        ].filter(entry => entry.value > 0); // Only show difficulties with solved problems
    }, [profileData.solvedByDifficulty]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0', '#19FFFF'];
    const DIFFICULTY_COLORS = {
        'Easy': '#00C49F', // Green
        'Medium': '#FFBB28', // Yellow
        'Hard': '#FF0000', // Red
    };

    // --- Heatmap Logic ---
    // Refined to simplify month label positioning and use CSS Grid for the layout

    const getHeatmapColor = (count) => {
        if (count === 0) return 'bg-gray-800'; // No submissions
        if (count <= 2) return 'bg-green-700 hover:bg-green-600';
        if (count <= 5) return 'bg-green-600 hover:bg-green-500';
        if (count <= 10) return 'bg-green-500 hover:bg-green-400';
        return 'bg-green-400 hover:bg-green-300'; // More than 10
    };

    const heatmapData = useMemo(() => {
        const totalDays = 365;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const days = [];
        for (let i = totalDays - 1; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            days.push(date);
        }

        const grid = Array.from({ length: 7 }, () => []); // 7 rows for Mon-Sun
        const monthMap = new Map(); // Store month name and its starting column index

        // Calculate initial padding for the first week to align days correctly
        const firstDayOfWeekOfRangeStart = days[0].getDay(); // 0=Sun, 1=Mon, ..., 6=Sat
        const initialPaddingDays = (firstDayOfWeekOfRangeStart === 0) ? 6 : firstDayOfWeekOfRangeStart - 1; // Convert Sun->6, Mon->0

        // Pad the beginning of the grid
        for (let i = 0; i < initialPaddingDays; i++) {
            grid[i % 7].push({ date: null, count: 0, isEmpty: true });
        }

        days.forEach((date) => {
            const dayOfWeek = date.getDay(); // 0 (Sun), 1 (Mon), ..., 6 (Sat)
            const gridRowIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; // Convert to 0 (Mon), ..., 6 (Sun)

            const dateString = date.toISOString().split('T')[0];
            const count = profileData.dailySubmissionCounts?.[dateString] || 0;

            grid[gridRowIndex].push({ date, count, isEmpty: false });

            // Store month label position for the first day of each month
            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (!monthMap.has(monthKey)) {
                // Calculate the column index for this date
                // This is the current number of cells in any row + the initial padding, divided by 7 (days in a week)
                const currentColumn = Math.floor(grid[gridRowIndex].length / 7); // Simplified column index
                monthMap.set(monthKey, {
                    month: date.toLocaleString('default', { month: 'short' }),
                    // This offset will be determined by CSS grid column positioning
                    // We just need the *index* of the column where the month starts
                    columnIndex: grid[0].length - 1 // The column where this day ends up
                });
            }
        });

        // Ensure all rows have the same number of columns by padding the end
        const maxColumns = Math.max(...grid.map(row => row.length));
        for (let i = 0; i < 7; i++) {
            while (grid[i].length < maxColumns) {
                grid[i].push({ date: null, count: 0, isEmpty: true });
            }
        }
        
        // Convert monthMap to an array, and refine column indices for display
        const monthLabels = Array.from(monthMap.values()).map((monthData, idx) => {
            // Re-calculate effective offset for month labels based on *final* grid structure
            // Each cell is 12px + 2px gap = 14px. Column starts from the 2nd column (index 1) after day labels.
            // Adjust `30` if your day labels (Mon, Tue...) have different width.
            const offset = (monthData.columnIndex * 14) + 30; // Approx. width of day labels + cell width * column index
            return { ...monthData, offset };
        });


        return { grid, monthLabels, numWeeks: maxColumns };
    }, [profileData.dailySubmissionCounts]); // Re-calculate only when submission counts change

    const daysOfWeekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

    // --- End Heatmap Logic ---

    const containerVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: {
            opacity: 1,
            y: 0,
            transition: {
                duration: 0.6,
                ease: "easeOut",
                when: "beforeChildren",
                staggerChildren: 0.1
            }
        }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <p className="text-white text-lg">Loading profile...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4">
                <p className="text-red-400 text-lg mb-4">{error}</p>
                <Button onClick={() => window.location.reload()} className="mt-4">
                    Retry
                </Button>
            </div>
        );
    }

    if (!profileData || !profileData.userName) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <p className="text-gray-400 text-lg">User data not available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 flex justify-center">
            <motion.div
                className="w-full max-w-7xl" // Adjusted max-width for better content flow, let heatmap overflow if needed
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Card className="bg-gray-800 border border-gray-700 shadow-xl p-6 lg:p-8">
                    <motion.div variants={itemVariants} className="text-center mb-8">
                        <FaUserCircle className="w-24 h-24 text-blue-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-extrabold text-white">
                            {profileData.userName}
                        </h2>
                    </motion.div>

                    {/* Main content area: Two Columns */}
                    <div className="flex flex-col lg:flex-row gap-8">
                        {/* Left Section: User Info & Stats (Thinner) */}
                        <div className="lg:w-1/3 flex flex-col gap-6">
                            <motion.div variants={itemVariants}>
                                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center"><FaUserCircle className="mr-2" /> General Information</h3>
                                <div className="space-y-4 text-left">
                                    <p className="flex items-center text-lg text-gray-300">
                                        <FaEnvelope className="mr-3 text-blue-300" />
                                        <strong>Email:</strong> {profileData.email}
                                    </p>
                                    <p className="flex items-center text-lg text-gray-300">
                                        <FaChartLine className="mr-3 text-green-300" />
                                        <strong>Problems Solved:</strong> {profileData.problemsSolved}
                                    </p>
                                    <p className="flex items-center text-lg text-gray-300">
                                        <FaFire className="mr-3 text-orange-400" />
                                        <strong>Current Streak:</strong> {profileData.streak}
                                    </p>
                                </div>
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center"><FaCode className="mr-2" /> Language Usage</h3>
                                {languageChartData.length > 0 ? (
                                    <div className="bg-gray-700 p-4 rounded-lg min-h-[280px] flex items-center justify-center"> {/* Added min-height */}
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={languageChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    labelLine={false}
                                                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                >
                                                    {languageChartData.map((entry, index) => (
                                                        <Cell key={`cell-lang-${index}`} fill={COLORS[index % COLORS.length]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: '#ccc', paddingTop: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="bg-gray-700 p-4 rounded-lg min-h-[280px] flex items-center justify-center">
                                        <p className="text-gray-400 text-center py-4">No language data available yet.</p>
                                    </div>
                                )}
                            </motion.div>

                            <motion.div variants={itemVariants}>
                                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center"><FaAward className="mr-2" /> Difficulty Breakdown</h3>
                                {difficultyChartData.length > 0 ? (
                                    <div className="bg-gray-700 p-4 rounded-lg min-h-[280px] flex items-center justify-center"> {/* Added min-height */}
                                        <ResponsiveContainer width="100%" height={250}>
                                            <PieChart>
                                                <Pie
                                                    data={difficultyChartData}
                                                    cx="50%"
                                                    cy="50%"
                                                    outerRadius={80}
                                                    fill="#8884d8"
                                                    dataKey="value"
                                                    labelLine={false}
                                                    label={({ name, value }) => `${name} (${value})`}
                                                >
                                                    {difficultyChartData.map((entry, index) => (
                                                        <Cell key={`cell-diff-${index}`} fill={DIFFICULTY_COLORS[entry.name]} />
                                                    ))}
                                                </Pie>
                                                <Tooltip
                                                    contentStyle={{ backgroundColor: '#333', border: 'none', borderRadius: '5px' }}
                                                    itemStyle={{ color: '#fff' }}
                                                />
                                                <Legend layout="horizontal" verticalAlign="bottom" align="center" wrapperStyle={{ color: '#ccc', paddingTop: '10px' }} />
                                            </PieChart>
                                        </ResponsiveContainer>
                                    </div>
                                ) : (
                                    <div className="bg-gray-700 p-4 rounded-lg min-h-[280px] flex items-center justify-center">
                                        <p className="text-gray-400 text-center py-4">Solve problems to see breakdown.</p>
                                    </div>
                                )}
                            </motion.div>
                        </div>

                        {/* Right Section: Heatmap & Submissions (Wider) */}
                        <div className="lg:flex-1 flex flex-col gap-6">
                            {/* Submission Heatmap Card */}
                            <motion.div variants={itemVariants} className="mt-0">
                                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                                    <FaCalendarAlt className="mr-2 text-teal-300" /> Daily Submissions (Last 365 Days)
                                </h3>
                                <div className="relative p-2 border border-gray-700 rounded-lg bg-gray-700 overflow-x-auto custom-scrollbar-horizontal"> {/* Added overflow-x-auto */}
                                    {/* Month Labels - Positioned relative to the scrollable container */}
                                    <div className="relative h-5 mb-1 ml-[30px] flex text-xs text-gray-400 pointer-events-none">
                                        {/* This div will be directly above the grid content and scroll with it */}
                                        {heatmapData.monthLabels.map((month, idx) => (
                                            <span
                                                key={idx}
                                                className="absolute text-left"
                                                style={{ left: `${month.offset}px` }}
                                            >
                                                {month.month}
                                            </span>
                                        ))}
                                    </div>

                                    <div className="flex">
                                        {/* Vertical Day Labels (Mon, Tue, etc.) */}
                                        <div className="flex flex-col gap-0.5 text-gray-400 text-xs pr-2 flex-shrink-0"> {/* flex-shrink-0 to prevent shrinking */}
                                            {daysOfWeekLabels.map((day, index) => (
                                                <div key={index} className="h-3 flex items-center justify-end">{day}</div>
                                            ))}
                                        </div>

                                        {/* Heatmap Grid Cells - Using CSS Grid for better alignment */}
                                        <div
                                            className="grid gap-0.5"
                                            style={{
                                                gridTemplateColumns: `repeat(${heatmapData.numWeeks}, minmax(0, 1fr))`,
                                                gridTemplateRows: 'repeat(7, minmax(0, 1fr))', // 7 rows for days of week
                                                // Ensure explicit width based on number of columns to enable consistent horizontal scroll
                                                width: `${heatmapData.numWeeks * 14}px` // 14px = w-3 (12px) + gap-0.5 (2px)
                                            }}
                                        >
                                            {/* Flat map all cells for a single grid container */}
                                            {heatmapData.grid.flat().map((dayData, index) => (
                                                <div
                                                    key={index} // Index is safe here because we flatten the grid
                                                    title={dayData && !dayData.isEmpty ? `${dayData.date.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}: ${dayData.count} submissions` : 'No submissions'}
                                                    className={`w-3 h-3 border border-gray-700 rounded-sm transition-colors duration-150 ${dayData.isEmpty ? 'bg-gray-900 cursor-not-allowed' : getHeatmapColor(dayData.count)}`}
                                                ></div>
                                            ))}
                                        </div>
                                    </div>
                                    <p className="text-right text-gray-500 text-sm mt-4 w-full">More green = more submissions!</p>
                                </div>
                            </motion.div>

                            {/* Recent Submissions Section */}
                            <motion.div variants={itemVariants} className="mt-6">
                                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                                    <FaListAlt className="mr-2 text-blue-300" /> Recent Submissions
                                </h3>
                                <div className="bg-gray-700 p-4 rounded-lg border border-gray-600">
                                    {profileData.recentSubmissions && profileData.recentSubmissions.length > 0 ? (
                                        <ul className="space-y-3">
                                            {profileData.recentSubmissions.map((submission, index) => (
                                                <li key={index} className="bg-gray-600 p-3 rounded-md flex justify-between items-center text-gray-200">
                                                    <span>{submission.problemName}</span>
                                                    <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${
                                                        submission.verdict === 'Accepted' ? 'bg-green-500' : 'bg-red-500'
                                                    }`}>
                                                        {submission.verdict}
                                                    </span>
                                                </li>
                                            ))}
                                        </ul>
                                    ) : (
                                        <p className="text-gray-400">No recent submissions to display.</p>
                                    )}
                                    <Button variant="secondary" className="mt-4 w-full">
                                        View All Submissions
                                    </Button>
                                </div>
                            </motion.div>
                        </div>
                    </div>

                    <motion.div variants={itemVariants} className="mt-8 text-center">
                        <Button
                            variant="primary"
                            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg"
                            onClick={() => alert('Edit Profile functionality coming soon!')}
                        >
                            Edit Profile
                        </Button>
                    </motion.div>
                </Card>
            </motion.div>
        </div>
    );
};

export default ProfilePage;