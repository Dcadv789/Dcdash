import React, { useState, useRef, useEffect } from 'react';
import { Settings, Building2, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const SettingsDropdown: React.FC = () => {
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
        <Settings size={20} />
        <span className="text-sm font-medium flex-1 text-left">Configurações</span>
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 mt-2 w-[200px] bg-black rounded-xl shadow-lg py-1 border border-gray-800"
        >
          <button
            onClick={() => {
              navigate('/empresas');
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-blue-600"
          >
            <Building2 size={16} className="mr-2" />
            Empresas
          </button>
          <button
            onClick={() => {
              navigate('/usuarios');
              setIsOpen(false);
            }}
            className="w-full flex items-center px-4 py-2 text-sm text-gray-400 hover:text-white hover:bg-blue-600"
          >
            <Users size={16} className="mr-2" />
            Usuários
          </button>
        </div>
      )}
    </div>
  );
};

export default SettingsDropdown;