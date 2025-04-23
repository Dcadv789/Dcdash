import React, { ReactNode } from 'react';
import { NavLink } from 'react-router-dom';

interface NavItemProps {
  to: string;
  icon?: ReactNode;
  children: ReactNode;
  className?: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, children, className = '' }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex items-center py-3 px-4 rounded-lg transition-colors ${
          isActive ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white hover:bg-gray-900'
        } ${className}`
      }
    >
      {icon && <span className="mr-3">{icon}</span>}
      {children}
    </NavLink>
  );
};

export default NavItem;