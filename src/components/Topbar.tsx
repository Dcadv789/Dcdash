import React from 'react';
import { Users, Building2, Shield, User } from 'lucide-react';
import NavItem from './navigation/NavItem';

const navItems = [
  { path: '/usuarios', label: 'Usuários', icon: <Users size={20} /> },
  { path: '/empresas', label: 'Empresas', icon: <Building2 size={20} /> },
  { path: '/permissoes', label: 'Permissões', icon: <Shield size={20} /> },
  { path: '/perfil', label: 'Perfil', icon: <User size={20} /> },
];

const Topbar: React.FC = () => {
  return (
    <header className="fixed top-4 left-72 right-4 h-16 bg-black rounded-2xl shadow-lg flex items-center px-6 z-10">
      <nav className="flex-1 flex justify-end">
        <ul className="flex space-x-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavItem to={item.path} icon={item.icon}>
                {item.label}
              </NavItem>
            </li>
          ))}
        </ul>
      </nav>
    </header>
  );
};

export default Topbar;