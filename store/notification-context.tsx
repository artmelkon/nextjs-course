import React, { createContext, useState, useEffect, useRef } from "react";

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
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if(activeNotification && (activeNotification['status'] === 'success' || activeNotification['status'] === 'error')) {
      timerRef.current = setTimeout(() => {
        setActiveNotification(null);
        timerRef.current = null;
      }, 3000);

      return () => {
        if (timerRef.current) clearTimeout(timerRef.current);
      };
    }
  }, [activeNotification]);

  function showNotificationHandler(notificationData: any) {
    setActiveNotification(notificationData);
  }
  function hideNotificationHandler() {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
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
