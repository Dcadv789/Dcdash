import React, { useState, useRef, useEffect } from 'react';
import { LogOut, User, Eye } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';

const ProfileDropdown: React.FC = () => {
  const { user, signOut } = useAuth();
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center space-x-3 py-3 px-4 rounded-lg transition-colors text-gray-400 hover:text-white hover:bg-gray-900 min-w-[200px]"
      >
        <User size={20} />
        <div className="text-left flex-1">
          <div className="text-sm font-medium">Perfil</div>
          <div className="text-xs text-gray-500">{user?.email}</div>
        </div>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-[200px] bg-black rounded-xl shadow-lg py-1 border border-gray-800"
        >
          <button
            onClick={() => {
              navigate('/perfil');
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-blue-600"
          >
            <Eye size={16} className="mr-2" />
            Visualizar
          </button>
          <button
            onClick={signOut}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-blue-600"
          >
            <LogOut size={16} className="mr-2" />
            Sair
          </button>
        </div>
      )}
    </div>
  );
};

export default ProfileDropdown;