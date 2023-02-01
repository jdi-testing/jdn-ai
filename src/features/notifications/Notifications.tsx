import { Alert, AlertProps, Button, notification } from "antd";
import { last } from "lodash";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../app/store";
import { selectLocators } from "../locators/locatorSelectors";
import { messages } from "./utils/messages";
import { Action } from "./notification.types";
import { useNotificationController } from "./utils/useNotificationController";

export const Notifications = () => {
  const dispatch = useDispatch();
  const lastNotification = useSelector((state: RootState) => last(state.main.notifications));
  const locators = useSelector(selectLocators);

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
    openNotification(messages().ACTION_CANCELLED, "warning");
  };

  const openNotification = (message: string, type: AlertProps["type"], action?: Action) => {
    notification.destroy();

    const container = document.body.querySelector(".jdn__notification") as HTMLElement;

    container &&
      notification.open({
        message: <Alert showIcon message={message} type={type} action={renderCancelButton(action)} />,
        duration: 5,
        getContainer: () => container,
        placement: "bottomRight",
      });
  };

  useNotificationController(lastNotification, locators, openNotification);

  return <div className="jdn__notification" />;
};
