import React from 'react';
import NotificationItem from './NotificationItem';
import { Notification } from './NotificationProvider';

interface NotificationContainerProps {
  notifications: Notification[];
  removeNotification: (id: string) => void;
}

const NotificationContainer: React.FC<NotificationContainerProps> = ({
  notifications,
  removeNotification,
}) => {
  return (
    <div className="fixed left-1/2 -translate-x-1/2 top-[20%] z-50 flex flex-col items-center gap-2">
      {notifications.map((notification) => (
        <NotificationItem
          key={notification.id}
          {...notification}
          onRemove={removeNotification}
        />
      ))}
    </div>
  );
};

export default NotificationContainer;