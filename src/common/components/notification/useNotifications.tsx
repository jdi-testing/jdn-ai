import { Button, notification } from "antd";
import { last } from "lodash";
import React, { useLayoutEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";

import { Action } from "./types/notification.types";
import { messages } from "./utils/messages";
import { useNotificationController } from "./utils/useNotificationController";
import { NotificationInstance } from "antd/lib/notification";

export const useNotifications = (container?: HTMLElement | null) => {
  const [bottom, setBottom] = React.useState(0);
  const dispatch = useDispatch();
  const lastNotification = useSelector((state: RootState) => last(state.main.notifications));

  useLayoutEffect(() => {
    const containerBottom = container?.getBoundingClientRect().bottom;
    const docBottom = document.documentElement.getBoundingClientRect().bottom;
    setBottom(containerBottom ? docBottom - containerBottom : 0);
  }, [container]);

  const renderCancelButton = (action: Action) =>
    action ? (
      <Button size="small" type="text" onClick={cancelNotification(action)}>
        Cancel
      </Button>
    ) : null;

  const cancelNotification = (action: Action) => () => {
    if (Array.isArray(action)) {
      action.forEach((_action) => {
        dispatch(_action);
      });
    } else dispatch(action);
    openNotification(messages().ACTION_CANCELLED, "info");
  };

  const openNotification = (
    message: string,
    type: keyof NotificationInstance,
    cancelAction?: Action,
    description?: string
  ) => {
    notification.destroy();

    const _message = description ? (
      message
    ) : (
      <div className="jdn__notification_message">
        {message}
        {renderCancelButton(cancelAction)}
      </div>
    );

    notification[type]({
      message: _message,
      description,
      duration: 500,
      getContainer: () => container || document.body,
      placement: "bottom",
      bottom,
    });
  };

  useNotificationController(lastNotification, openNotification);
};
