import React, { useEffect } from 'react';
import { CheckCircle, XCircle, Info } from 'lucide-react';

export type NotificationType = 'success' | 'error' | 'info';

interface NotificationItemProps {
  id: string;
  message: string;
  type: NotificationType;
  onRemove: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ id, message, type, onRemove }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onRemove(id);
    }, 4000);

    return () => clearTimeout(timer);
  }, [id, onRemove]);

  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle className="text-[#2ecc71]" size={20} />;
      case 'error':
        return <XCircle className="text-[#e74c3c]" size={20} />;
      case 'info':
        return <Info className="text-[#3498db]" size={20} />;
    }
  };

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return 'border-[#2ecc71]/20 text-[#2ecc71]';
      case 'error':
        return 'border-[#e74c3c]/20 text-[#e74c3c]';
      case 'info':
        return 'border-[#3498db]/20 text-[#3498db]';
    }
  };

  return (
    <div
      className={`flex items-center gap-3 min-w-[320px] max-w-md bg-black border ${getTypeStyles()} 
        rounded-xl p-4 shadow-lg animate-notification`}
    >
      {getIcon()}
      <p className="flex-1 text-sm text-white">{message}</p>
    </div>
  );
};

export default NotificationItem;