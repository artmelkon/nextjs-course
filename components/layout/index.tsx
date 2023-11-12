import { Fragment, useContext } from "react";
import Header from "./Header";
import Notification from "../ui/notification";
import NotificationContext from "@/store/notification-context";

const Layout = ({children}: any) => {
  const notificationCtx = useContext(NotificationContext);
  const activeNotification = notificationCtx.notification;
  return (
    <Fragment>
      <Header />
      <main>
        {children}
      </main>
      {activeNotification && <Notification title={activeNotification.title} message={activeNotification.message} status={activeNotification.status} />}
    </Fragment>
  )
}

export default Layout;
