// src/components/UI/Card.jsx
import React from 'react';

const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-gray-800 p-6 rounded-lg shadow-md ${className}`}>
      {children}
    </div>
  );
};

export default Card;