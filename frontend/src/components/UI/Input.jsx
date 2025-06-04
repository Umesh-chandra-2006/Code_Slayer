import React from 'react';

const Input = ({ type = 'text', placeholder, value, onChange, className = '', ...props }) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      className={`w-full p-3 rounded-md bg-gray-700 text-gray-100 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-gray-400 ${className}`}
      {...props}
    />
  );
};

export default Input;
