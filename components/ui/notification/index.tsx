// import ReactDOM from 'react-dom';
import React, {useContext} from "react";

import classes from "./notification.module.css";
import NotificationContext from "@/store/notification-context";

interface NotificationProps {
  title: string;
  message: string;
  status: string;
}
const Notification: React.FC<NotificationProps> = ({
  title,
  message,
  status,
}) => {
  const notificationCts = useContext(NotificationContext);
  let statusClasses = "";
  if (status === "success") {
    statusClasses = classes.success;
  }
  if (status === "error") {
    statusClasses = classes.error;
  }
  if(status === 'pending') {
    statusClasses = classes.pending;
  }

  const cssClasses = `${classes.notification} ${statusClasses}`;
  return (
    <div className={cssClasses} onClick={notificationCts.hideNotification}>
      <h2>{title}</h2>
      <p>{message}</p>
    </div>
  );
};

export default Notification;
