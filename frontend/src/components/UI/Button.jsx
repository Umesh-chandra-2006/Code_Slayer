// src/components/UI/Button.jsx
import React from 'react';

const Button = ({ children, onClick, type = 'button', variant = 'primary', className = '', ...props }) => {
  let baseClasses = 'px-4 py-2 rounded-md font-semibold text-white transition duration-300 ';
  if (variant === 'primary') {
    baseClasses += 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50';
  } else if (variant === 'secondary') {
    baseClasses += 'bg-gray-600 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-opacity-50';
  } else if (variant === 'success') {
    baseClasses += 'bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50';
  } else if (variant === 'danger') {
    baseClasses += 'bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50';
  }
  // Add more variants as needed (e.g., 'outline', 'text')

  return (
    <button
      type={type}
      onClick={onClick}
      className={`${baseClasses} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

export default Button;