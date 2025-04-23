import React, { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
}

const Card: React.FC<CardProps> = ({ children, className = '' }) => {
  return (
    <div className={`bg-[#1e1e1e] rounded-2xl p-6 shadow-lg ${className}`}>
      {children}
    </div>
  );
};

export default Card;