import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import Card from '../components/UI/Card'; // Assuming you have a Card component
import Button from '../components/UI/Button'; // Assuming you have a Button component
import { FaUserCircle, FaEnvelope, FaChartLine, FaTrophy } from 'react-icons/fa'; // Icons for visual appeal

const ProfilePage = () => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                setLoading(true);
                setError('');
                const token = localStorage.getItem('token');
                if (!token) {
                    setError('Authentication token not found. Please log in.');
                    setLoading(false);
                    return;
                }

                const config = {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                };

                // Adjust API endpoint as per your backend route for fetching user profile
                const { data } = await axios.get('http://localhost:5000/api/user/profile', config);
                console.log('Profile data:', data);
                setUser(data);
                setLoading(false);
            } catch (err) {
                console.error('Error fetching user profile:', err);
                setError('Failed to load user profile. Please try again.');
                setLoading(false);
            }
        };

        fetchProfile();
    }, []);

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
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <p className="text-red-400 text-lg">{error}</p>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
                <p className="text-gray-400 text-lg">User data not available.</p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-900 text-gray-100 p-4 sm:p-6 lg:p-8 flex items-center justify-center">
            <motion.div
                className="w-full max-w-2xl"
                variants={containerVariants}
                initial="hidden"
                animate="visible"
            >
                <Card className="bg-gray-800 border border-gray-700 shadow-xl p-6 lg:p-8 text-center">
                    <motion.div variants={itemVariants} className="mb-6">
                        <FaUserCircle className="w-24 h-24 text-blue-400 mx-auto mb-4" />
                        <h2 className="text-3xl font-extrabold text-white">
                            {user.username || 'Coder'}
                        </h2>
                    </motion.div>

                    <motion.div variants={itemVariants} className="space-y-4 text-left mb-8">
                        <p className="flex items-center text-lg text-gray-300">
                            <FaEnvelope className="mr-3 text-blue-300" />
                            <strong>Email:</strong> {user.email}
                        </p>
                        {/* Placeholder for additional dynamic data */}
                        <p className="flex items-center text-lg text-gray-300">
                            <FaChartLine className="mr-3 text-green-300" />
                            <strong>Problems Solved:</strong> {user.problemsSolved || 0}
                        </p>
                        <p className="flex items-center text-lg text-gray-300">
                            <FaTrophy className="mr-3 text-yellow-300" />
                            <strong>Rank:</strong> {user.rank || 'Unranked'}
                        </p>
                    </motion.div>

                    <motion.div variants={itemVariants}>
                        <Button
                            variant="primary"
                            className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-500 text-white hover:from-blue-600 hover:to-purple-600 shadow-lg"
                            onClick={() => alert('Edit Profile functionality coming soon!')} // Placeholder action
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