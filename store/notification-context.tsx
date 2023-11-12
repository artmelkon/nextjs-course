import React, { createContext, useState, useEffect } from "react";

export interface NotificationType {
  notification?: any;
  showNotification: (notificationData: any) => void;
  hideNotification: () => void;
}

const NotificationContext = createContext<NotificationType>({
  notification: null, // {title, message, status}
  showNotification: (notificationData) => {},
  hideNotification: () => {},
});



export const NotificationContextProvider = ({ children }: any) => {
  const [activeNotification, setActiveNotification] = useState(null);
  useEffect(() => {
    if(activeNotification && (activeNotification['status'] === 'success' || activeNotification['status'] === 'error')) {
      const setTimer = setTimeout(() => {
        setActiveNotification(null)
      }, 3000);

      return () => {clearTimeout(setTimer)}
    }
  }, [activeNotification]);

  function showNotificationHandler(notificationData: any) {
    setActiveNotification(notificationData);
  }
  function hideNotificationHandler() {
    setActiveNotification(null);
  }

  const context = {
    notification: activeNotification,
    showNotification: showNotificationHandler,
    hideNotification: hideNotificationHandler,
  };
  return (
    <NotificationContext.Provider value={context}>
      {children}
    </NotificationContext.Provider>
  );
};

export default NotificationContext;
