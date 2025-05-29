// src/components/UI/Badge.jsx
import React from 'react';

const Badge = ({ children, variant = 'default', className = '' }) => {
  let baseClasses = 'px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center justify-center ';
  if (variant === 'easy') {
    baseClasses += 'bg-green-500 text-white';
  } else if (variant === 'medium') {
    baseClasses += 'bg-yellow-500 text-gray-900';
  } else if (variant === 'hard') {
    baseClasses += 'bg-red-500 text-white';
  } else if (variant === 'accepted') {
    baseClasses += 'bg-green-500 text-white';
  } else if (variant === 'wrong-answer') {
    baseClasses += 'bg-red-500 text-white';
  } else { // default
    baseClasses += 'bg-gray-600 text-gray-100';
  }

  return (
    <span className={`${baseClasses} ${className}`}>
      {children}
    </span>
  );
};

export default Badge;