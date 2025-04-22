import React from 'react';
import { Activity } from 'lucide-react';

const StatusIndicator: React.FC = () => {
  return (
    <div className="flex items-center p-4 bg-gray-900 rounded-lg border border-gray-800">
      <div className="flex items-center justify-center bg-gray-800 rounded-full p-2 mr-3">
        <Activity size={18} className="text-green-500" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-300">Status do Serviço</p>
        <p className="text-sm text-green-500">Online</p>
      </div>
    </div>
  );
};

export default StatusIndicator;