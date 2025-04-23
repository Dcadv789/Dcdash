import React, { createContext, useState, useCallback } from 'react';
import NotificationContainer from './NotificationContainer';
import { NotificationType } from './NotificationItem';

export interface Notification {
  id: string;
  message: string;
  type: NotificationType;
}

interface NotificationContextType {
  notifySuccess: (message: string) => void;
  notifyError: (message: string) => void;
  notifyInfo: (message: string) => void;
}

export const NotificationContext = createContext<NotificationContextType>({
  notifySuccess: () => {},
  notifyError: () => {},
  notifyInfo: () => {},
});

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const createNotification = useCallback((type: NotificationType, message: string) => {
    const id = Math.random().toString(36).substring(2, 9);
    setNotifications((prev) => [...prev, { id, message, type }]);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id));
  }, []);

  const notifySuccess = useCallback((message: string) => {
    createNotification('success', message);
  }, [createNotification]);

  const notifyError = useCallback((message: string) => {
    createNotification('error', message);
  }, [createNotification]);

  const notifyInfo = useCallback((message: string) => {
    createNotification('info', message);
  }, [createNotification]);

  return (
    <NotificationContext.Provider value={{ notifySuccess, notifyError, notifyInfo }}>
      {children}
      <NotificationContainer
        notifications={notifications}
        removeNotification={removeNotification}
      />
    </NotificationContext.Provider>
  );
};

export default NotificationProvider;