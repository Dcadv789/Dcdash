import React from 'react';
import { LayoutDashboard } from 'lucide-react';

const Logo: React.FC = () => {
  return (
    <div className="flex justify-center items-center h-24 mb-8">
      <div className="bg-gray-800 rounded-full p-4">
        <LayoutDashboard size={48} className="text-white" />
      </div>
    </div>
  );
};

export default Logo;