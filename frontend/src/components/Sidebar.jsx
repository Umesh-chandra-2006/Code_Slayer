import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  FaBars,
  FaHome,
  FaBookOpen,
  FaCode,
  FaUser,
  FaTrophy,
  FaSignOutAlt,
  FaClipboardList,
} from 'react-icons/fa';

const navItems = [
  { icon: FaHome, label: 'Dashboard', href: '/dashboard' },
  { icon: FaBookOpen, label: 'Problems', href: '/problems' },
  { icon: FaClipboardList, label: 'Submissions', href: '/submissions' },
  { icon: FaCode, label: 'Editor', href: '/editor' },
  { icon: FaTrophy, label: 'Leaderboard', href: '/leaderboard' },
];

const Sidebar = ({ isOpen, toggleSidebar }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isHovered, setIsHovered] = useState(false);
  const [userInitials, setUserInitials] = useState('U');

  const expanded = isOpen || isHovered;

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    if (user && user.userName) {
      const nameParts = user.userName.split(' ');
      if (nameParts.length >= 2) {
        setUserInitials(`${nameParts[0].charAt(0)}${nameParts[nameParts.length - 1].charAt(0)}`);
      } else if (nameParts.length === 1) {
        setUserInitials(nameParts[0].charAt(0));
      }
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    navigate('/login');
  };

  return (
    <aside
      className={`
        bg-gray-900 border-r border-gray-700 z-30
        transition-all duration-300 ease-in-out
        ${expanded ? 'w-64' : 'w-[70px]'}
        fixed top-16 left-0
        /* NO h-screen here - height is content-based */
        flex flex-col
        max-h-[calc(100vh-4rem)] /* Limits sidebar height to viewport - header height */
      `}
      onMouseEnter={() => !isOpen && setIsHovered(true)}
      onMouseLeave={() => !isOpen && setIsHovered(false)}
    >
      {/* This inner div's overflow-y-auto is good for internal sidebar content scrolling if it overflows */}
      <div className="flex flex-col flex-1 py-4 px-2 overflow-y-auto overflow-x-hidden">
        {/* Hamburger icon is now positioned relative to the top of the sidebar's content */}
        <button
          onClick={toggleSidebar}
          className="text-white text-2xl hover:text-blue-400 mb-6 px-3 py-2 rounded-md transition self-start"
        >
          <FaBars />
        </button>

        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map((item) => {
            const isActive = location.pathname === item.href;
            return (
              <div key={item.href} className="relative group">
                <Link
                  to={item.href}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md font-medium
                    transition-all duration-200
                    ${isActive ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}
                    ${expanded ? 'justify-start' : 'justify-center'}
                  `}
                >
                  <item.icon className="text-2xl shrink-0" />
                  <span
                    className={`text-sm transition-all duration-300 ${
                      expanded ? 'opacity-100 ml-1' : 'opacity-0 w-0 overflow-hidden'
                    }`}
                  >
                    {item.label}
                  </span>
                </Link>

                {!expanded && (
                  <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2
                    bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg
                    opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-40"
                  >
                    {item.label}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="mt-auto px-2">
          <div className="border-t border-gray-700 mx-2 mb-2" />
          <Link
            to="/profile" // Assuming your profile route is /profile
            className={`
              flex items-center gap-3 py-2 rounded-md font-medium w-full mb-1 
              transition-all duration-200
              ${location.pathname === '/profile' ? 'bg-blue-600 text-white' : 'text-gray-300 hover:bg-gray-800'}
              ${expanded ? 'justify-start px-3' : 'justify-center'}
            `}
            aria-label="Go to profile page"
          >
            {expanded ? (
              // Display icon and text when expanded
              <>
                <FaUser className="text-2xl shrink-0" />
                <span className="text-sm transition-all duration-300 opacity-100 ml-1">
                  Profile
                </span>
              </>
            ) : (
              // Display user initials circle when collapsed
              <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center text-sm font-bold uppercase shrink-0">
                {userInitials}
              </div>
            )}
            {/* Tooltip for collapsed state */}
            {!expanded && (
              <div className="absolute left-full top-1/2 -translate-y-1/2 ml-2
                bg-gray-800 text-white text-xs px-2 py-1 rounded shadow-lg
                opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-40"
              >
                Profile
              </div>
            )}
          </Link>
          <button
            onClick={handleLogout}
            className={`
              flex items-center py-2 rounded-md font-medium w-full
              transition-all duration-200
              text-gray-300 hover:bg-gray-800
              ${expanded ? 'justify-start px-3' : 'justify-center'}
            `}
          >
            <FaSignOutAlt className="text-2xl shrink-0" />
            <span
              className={`text-sm transition-all duration-300 ${
                expanded ? 'opacity-100 ml-1' : 'opacity-0 w-0 overflow-hidden'
              }`}
            >
              Logout
            </span>
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;