import React from 'react';
import { Home, LayoutDashboard, FileText, PieChart } from 'lucide-react';
import StatusIndicator from './StatusIndicator';
import NavItem from './navigation/NavItem';
import Logo from './navigation/Logo';

const navItems = [
  { path: '/', label: 'Início', icon: <Home size={20} /> },
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={20} /> },
  { path: '/relatorios', label: 'Relatórios', icon: <FileText size={20} /> },
  { path: '/indicadores', label: 'Indicadores', icon: <PieChart size={20} /> },
];

const Sidebar: React.FC = () => {
  return (
    <aside className="fixed left-4 top-4 bottom-4 w-64 bg-black rounded-2xl flex flex-col p-4 shadow-lg">
      <Logo />

      <nav className="flex-1">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavItem to={item.path} icon={item.icon}>
                {item.label}
              </NavItem>
            </li>
          ))}
        </ul>
      </nav>

      <div className="mt-auto">
        <StatusIndicator />
      </div>
    </aside>
  );
};

export default Sidebar;