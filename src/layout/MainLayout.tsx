import React, { ReactNode } from 'react';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/Topbar';

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-[#1e1e1e] text-white">
      <div className="mx-auto max-w-[1920px] min-h-screen relative">
        <Sidebar />
        <Topbar />
        <main className="pt-24 pl-72 pr-4 pb-4">
          <div className="h-[calc(100vh-7rem)] bg-black rounded-2xl p-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
};

export default MainLayout;