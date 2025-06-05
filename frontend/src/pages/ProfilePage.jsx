

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
        dailySubmissionCounts: {}, 
        recentSubmissions: [], 
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
                    solvedByDifficulty: { ...profileData.solvedByDifficulty, ...data.solvedByDifficulty }, 
                    dailySubmissionCounts: data.dailySubmissionCounts || {},
                    recentSubmissions: data.recentSubmissions || [], 
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
        ].filter(entry => entry.value > 0); 
    }, [profileData.solvedByDifficulty]);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0', '#19FFFF'];
    const DIFFICULTY_COLORS = {
        'Easy': '#00C49F', 
        'Medium': '#FFBB28',
        'Hard': '#FF0000', 
    };




    const getHeatmapColor = (count) => {
        if (count === 0) return 'bg-gray-800'; 
        if (count <= 2) return 'bg-green-700 hover:bg-green-600';
        if (count <= 5) return 'bg-green-600 hover:bg-green-500';
        if (count <= 10) return 'bg-green-500 hover:bg-green-400';
        return 'bg-green-400 hover:bg-green-300'; 
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

        const grid = Array.from({ length: 7 }, () => []); 
        const monthMap = new Map(); 


        const firstDayOfWeekOfRangeStart = days[0].getDay(); 
        const initialPaddingDays = (firstDayOfWeekOfRangeStart === 0) ? 6 : firstDayOfWeekOfRangeStart - 1; 


        for (let i = 0; i < initialPaddingDays; i++) {
            grid[i % 7].push({ date: null, count: 0, isEmpty: true });
        }

        days.forEach((date) => {
            const dayOfWeek = date.getDay(); 
            const gridRowIndex = (dayOfWeek === 0) ? 6 : dayOfWeek - 1; 

            const dateString = date.toISOString().split('T')[0];
            const count = profileData.dailySubmissionCounts?.[dateString] || 0;

            grid[gridRowIndex].push({ date, count, isEmpty: false });


            const monthKey = `${date.getFullYear()}-${date.getMonth()}`;
            if (!monthMap.has(monthKey)) {


                const currentColumn = Math.floor(grid[gridRowIndex].length / 7); 
                monthMap.set(monthKey, {
                    month: date.toLocaleString('default', { month: 'short' }),


                    columnIndex: grid[0].length - 1 
                });
            }
        });


        const maxColumns = Math.max(...grid.map(row => row.length));
        for (let i = 0; i < 7; i++) {
            while (grid[i].length < maxColumns) {
                grid[i].push({ date: null, count: 0, isEmpty: true });
            }
        }
        

        const monthLabels = Array.from(monthMap.values()).map((monthData, idx) => {



            const offset = (monthData.columnIndex * 14) + 30; 
            return { ...monthData, offset };
        });


        return { grid, monthLabels, numWeeks: maxColumns };
    }, [profileData.dailySubmissionCounts]); 

    const daysOfWeekLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];



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
                className="w-full max-w-7xl" 
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

                    <div className="flex flex-col lg:flex-row gap-8">
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

                        <div className="lg:flex-1 flex flex-col gap-6">
                            <motion.div variants={itemVariants} className="mt-0">
                                <h3 className="text-xl font-bold text-gray-100 mb-4 flex items-center">
                                    <FaCalendarAlt className="mr-2 text-teal-300" /> Daily Submissions (Last 365 Days)
                                </h3>
                                <div className="relative p-2 border border-gray-700 rounded-lg bg-gray-700 overflow-x-auto custom-scrollbar-horizontal"> {/* Added overflow-x-auto */}
                                    <div className="relative h-5 mb-1 ml-[30px] flex text-xs text-gray-400 pointer-events-none">
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
                                        <div className="flex flex-col gap-0.5 text-gray-400 text-xs pr-2 flex-shrink-0"> 
                                            {daysOfWeekLabels.map((day, index) => (
                                                <div key={index} className="h-3 flex items-center justify-end">{day}</div>
                                            ))}
                                        </div>

                                        <div
                                            className="grid gap-0.5"
                                            style={{
                                                gridTemplateColumns: `repeat(${heatmapData.numWeeks}, minmax(0, 1fr))`,
                                                gridTemplateRows: 'repeat(7, minmax(0, 1fr))', 

                                                width: `${heatmapData.numWeeks * 14}px` 
                                            }}
                                        >
                                            {heatmapData.grid.flat().map((dayData, index) => (
                                                <div
                                                    key={index} 
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