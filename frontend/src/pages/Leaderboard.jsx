import React from 'react';
import { motion } from 'framer-motion'; 

const Leaderboard = () => {
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  };

  return (
    <motion.div
      className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center" 
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <h1 className="text-3xl font-bold text-gray-100 mb-6">Leaderboard</h1>

      <div className="bg-neutral-900 rounded-lg shadow-xl overflow-hidden border border-neutral-700 p-8">
        <h2 className="text-2xl font-semibold text-blue-400 mb-4">Feature Coming Soon!</h2>
        <p className="text-gray-300 text-lg mb-4">
          We're working hard to bring you exciting competitive features.
        </p>
        <p className="text-gray-400">
          Stay tuned for updates on our Leaderboard!
        </p>
        <div className="mt-8 flex justify-center">
            {/* Optional: Add a placeholder image or icon */}
            <svg className="h-24 w-24 text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
        </div>
      </div>
    </motion.div>
  );
};

export default Leaderboard;