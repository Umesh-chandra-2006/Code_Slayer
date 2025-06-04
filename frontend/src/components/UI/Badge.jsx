import React from 'react';
const Badge = ({ children, variant = 'default', className = '', ...props }) => {
  let baseClasses = 'px-2 py-0.5 rounded-full text-xs font-semibold inline-flex items-center justify-center ';

  if (variant === 'Easy') {
    baseClasses += 'bg-green-500 text-white';
  } else if (variant === 'Medium') {
    baseClasses += 'bg-yellow-500 text-gray-900';
  } else if (variant === 'Hard') {
    baseClasses += 'bg-red-500 text-white';
  } else if (variant === 'accepted') {
    baseClasses += 'bg-green-500 text-white';
  } else if (variant === 'wrong-answer') {
    baseClasses += 'bg-red-500 text-white';
  } else if (variant === 'success') {
    baseClasses += 'bg-green-500 text-white';
  } else if (variant === 'warning') {
    baseClasses += 'bg-yellow-500 text-gray-900';
  } else if (variant === 'danger') {
    baseClasses += 'bg-red-500 text-white';
  }
  return (

    <span className={`${baseClasses} ${className}`} {...props}>
      {children}
    </span>
  );
};

export default Badge;