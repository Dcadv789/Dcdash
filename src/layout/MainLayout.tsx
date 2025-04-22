import React, { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <div className="mx-auto max-w-[1920px] h-screen relative">
        <Sidebar />
        <Topbar />
        <main className="pt-24 pl-72 pr-4 pb-4 h-screen overflow-auto">
          <div className="max-h-[calc(100vh-theme(spacing.24))] rounded-2xl">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;