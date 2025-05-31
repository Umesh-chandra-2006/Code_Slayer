// src/components/Sidebar.jsx
import React from "react";
import { Link, useLocation } from "react-router-dom";
import {
  FaTachometerAlt,
  FaFlask,
  FaCode,
  FaPlus,
  FaSignOutAlt,
  FaUser,
  FaListAlt,
} from "react-icons/fa";
import { useNavigate } from "react-router-dom";

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const user = JSON.parse(localStorage.getItem("user"));
  const isAdmin = user?.role === "admin";

  const navItems = [
    { name: "Dashboard", icon: FaTachometerAlt, path: "/dashboard" },
    { name: "Problems", icon: FaFlask, path: "/problems" },
    { name: "Submissions", icon: FaListAlt, path: "/submissions" },
    { name: "Code Editor", icon: FaCode, path: "/editor" },
    {
      name: "Create Problem",
      icon: FaPlus,
      path: "/problems/new",
      adminOnly: true,
    },
    //{name: 'Admin Panel', icon: FaUser, path:'/admin', adminOnly:true},
  ];

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <div
      className={`fixed top-0 left-0 h-full bg-gray-800 text-gray-300 flex flex-col
        transition-all duration-300 ease-in-out z-20
        ${
          isOpen ? "w-48" : "w-16"
        } /* Increased open width for text, still 64px for icons */
        lg:w-48 /* Keep this width on large screens */
        overflow-hidden /* Crucial for hiding overflowing content */
        ${
          isOpen ? "p-4" : "p-2"
        } /* Adjust padding based on state for visual comfort */
      `}
    >
      {/* Logo */}
      <div className="flex items-center justify-start h-16 bg-gray-900 text-blue-400 font-bold text-xl cursor-pointer mb-6">
        <Link to="/dashboard" className="flex items-center w-full h-full">
          <span className="text-2xl whitespace-nowrap ml-2">{"< >"}</span>{" "}
          {/* Adjust margin-left */}
          <span
            className={`transition-opacity duration-300 ${
              isOpen ? "opacity-100 ml-2" : "opacity-0"
            }`}
          >
            Judge
          </span>
        </Link>
      </div>

      {/* Navigation Links */}
      <nav className="flex-1">
        <ul>
          {navItems
            .filter((item) => !item.adminOnly || isAdmin)
            .map((item) => (
              <li key={item.name} className="mb-2">
                <Link
                  to={item.path}
                  className={`flex items-center p-3 rounded-lg mx-auto ${
                    isOpen ? "justify-start" : "justify-center"
                  }
          ${
            location.pathname === item.path
              ? "bg-blue-600 text-white"
              : "hover:bg-gray-700"
          }
          transition-colors duration-200 ease-in-out w-full
        `}
                >
                  <item.icon
                    className={`h-6 w-6 ${isOpen ? "mr-3" : "mr-0"}`}
                  />
                  <span
                    className={`whitespace-nowrap transition-opacity duration-300 ${
                      isOpen ? "opacity-100" : "opacity-0"
                    }`}
                  >
                    {item.name}
                  </span>
                </Link>
              </li>
            ))}
        </ul>
      </nav>

      {/* User Profile and Logout */}
      <div className="p-4 border-t border-gray-700">
        <Link
          to="/profile"
          className={`flex items-center p-3 rounded-lg mx-auto mb-2 hover:bg-gray-700 transition-colors duration-200 ease-in-out w-full
            ${isOpen ? "justify-start" : "justify-center"}
          `}
        >
          <FaUser className={`h-6 w-6 ${isOpen ? "mr-3" : "mr-0"}`} />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            John Doe
          </span>
        </Link>
        <button
          onClick={handleLogout} // Replace with actual logout logic
          className={`flex items-center p-3 rounded-lg mx-auto w-full text-left hover:bg-gray-700 transition-colors duration-200 ease-in-out
            ${isOpen ? "justify-start" : "justify-center"}
          `}
        >
          <FaSignOutAlt className={`h-6 w-6 ${isOpen ? "mr-3" : "mr-0"}`} />
          <span
            className={`whitespace-nowrap transition-opacity duration-300 ${
              isOpen ? "opacity-100" : "opacity-0"
            }`}
          >
            Logout
          </span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
