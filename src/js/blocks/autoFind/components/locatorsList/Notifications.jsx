import { useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import { Button, notification } from "antd";

export const Notifications = ({toggleDeletedGroup, deletedSelected, generatedSelected}) => {
  const notifications = useSelector((state) => state.main.notifications);
  const [notificationMessage, setNotificationMessage] = useState("");
  useEffect(() => {
    if ( lastIndex >= 0 ) {
      if (notifications[lastIndex].message === 'DELETED' ) {
        if (notifications[lastIndex].data.length > 1) {
          setNotificationMessage(`${notifications[lastIndex].data.length} locators deleted successfully!`);
        } else {
          setNotificationMessage('The locator deleted successfully!');
        }
      }
      if (notifications[lastIndex].message === 'RESTORED' ) {
        if (notifications[lastIndex].data.length > 1) {
          setNotificationMessage(`${notifications[lastIndex].data.length} locators restored successfully!`);
        } else {
          setNotificationMessage('The locator restored successfully!');
        }
      }
    }
  }, [notifications]);


  useEffect(()=>{
    if (notificationMessage.length !== 0 ) {
      openNotification();
    }
  }, [notificationMessage]);

  const cancelNotification = () => {
    setNotificationMessage('Action canceled.');
    const lastIndex = notifications.length-1;
    if (notifications[lastIndex].message === 'DELETED' ) {
      toggleDeletedGroup(deletedSelected, true);
    }
    if (notifications[lastIndex].message === 'RESTORED' ) {
      toggleDeletedGroup(generatedSelected, false);
    };
  };

  const openNotification = () => {
    notification.destroy();

    if (notificationMessage !== 'Action canceled.') {
      const btn = (
        <Button type="primary" size="small" className="jdn__notification-close-btn" onClick={cancelNotification}>
          Cancel
        </Button>
      );
      notification.open({
        message: notificationMessage,
        duration: 7,
        getContainer: () => document.body.querySelector(".jdn__notification"),
        btn,
      });
    } else {
      notification.open({
        message: notificationMessage,
        duration: 7,
        getContainer: () => document.body.querySelector(".jdn__notification"),
      });
    }
  };

  return (
    <div className="jdn__notification"/>
  );
};

