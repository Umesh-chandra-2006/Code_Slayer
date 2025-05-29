// src/components/DashboardLayout.jsx (FINAL VERSION)
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import { FaBars } from 'react-icons/fa';

const DashboardLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth >= 1024);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <div className="flex min-h-screen bg-gray-900 text-gray-100">
      {/* Sidebar */}
      <Sidebar isOpen={isSidebarOpen} toggleSidebar={toggleSidebar} />

      {/* Main Content Area */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out
          ${isSidebarOpen ? 'ml-48' : 'ml-16'} /* Adjust margin-left based on sidebar width (48 for open, 16 for closed) */
          lg:ml-48 /* On large screens, always reserve space for full sidebar width */
        `}
      >
        {/* Top Bar / Header */}
        <header className="bg-gray-800 p-4 shadow-md flex items-center justify-between">
          <button
            onClick={toggleSidebar}
            className="text-gray-300 hover:text-white focus:outline-none flex items-center justify-center p-2 rounded-md hover:bg-gray-700"
          >
            <FaBars className="h-6 w-6" />
          </button>
          <div className="text-gray-300 text-lg font-semibold">Welcome back!</div>
        </header>

        {/* Page Content - rendered by React Router's Outlet */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;