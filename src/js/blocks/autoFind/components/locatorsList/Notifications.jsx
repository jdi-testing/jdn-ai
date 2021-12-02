import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import { Button, notification } from "antd";
import {
  cancelLastNotification,
  changeLocatorAttributes,
  handleLastNotification,
  toggleDeleted,
  toggleDeletedGroup,
} from "../../redux/predictionSlice";
import { last, size } from "lodash";
import { selectLocators } from "../../redux/selectors";
import {
  cancelStopGeneration,
  revertSettings,
  stopGeneration,
  stopGenerationGroup,
} from "../../redux/thunks";

const messages = (value) => {
  return {
    EDITED: "Locator edited successfully!",
    SETTINGS_CHANGED: "Locator settings changed successfully!",
    SETTINGS_CHANGED_GROUP: `Settings of ${value} changed successfully!`,
    RERUN: "The locator generation rerunned successfully",
    RERUN_GROUP: `Generation of ${value} rerunned successfully`,
    STOP_GENERATION: "The locator generation stopped successfully!",
    STOP_GENERATION_GROUP: `Generation of ${value} locators stopped successfully!`,
    DELETE: "The locator deleted successfully!",
    DELETE_GROUP: `${value} locators deleted successfully!`,
    RESTORE: "The locator restored successfully!",
    RESTORE_GROUP: `${value} locators restored successfully!`,
  };
};

export const Notifications = () => {
  const dispatch = useDispatch();
  const lastNotification = useSelector((state) => last(state.main.notifications));
  const locators = useSelector(selectLocators);
  let notificationMessage = "";
  let cancelAction;

  useEffect(() => {
    if (!lastNotification) return;

    if (lastNotification === "Download") {
      notificationMessage = "Java file downloaded successfully!";
    }

    const { isCanceled, isHandled, action, prevValue } = lastNotification;

    if (isCanceled && isHandled) return;
    if (isCanceled && !isHandled) {
      notificationMessage = "Action canceled.";
      dispatch(handleLastNotification());
    } else {
      switch (action?.type) {
        case "main/changeLocatorAttributes":
          const { element_id, type, name, locator } = prevValue;
          notificationMessage = messages().EDITED;
          cancelAction = changeLocatorAttributes({ type, name, element_id, locator: locator.customXpath });
          break;
        case "main/changeLocatorSettings":
          notificationMessage =
            size(prevValue) === 1 ? messages().SETTINGS_CHANGED : messages(size(prevValue)).SETTINGS_CHANGED_GROUP;
          cancelAction = revertSettings({ payload: action.payload, prevValue });
          break;
        case "main/rerunGeneration/pending":
          const { arg } = action.meta;
          if (size(arg) === 1) {
            notificationMessage = messages().RERUN;
            cancelAction = stopGeneration(arg[0].element_id);
          } else {
            notificationMessage = messages(length).RERUN_GROUP;
            cancelAction = stopGenerationGroup(arg);
          }
          break;
        case "main/stopGeneration/fulfilled":
          notificationMessage = messages().STOP_GENERATION;
          cancelAction = cancelStopGeneration([locators.find((_loc) => _loc.element_id === action.meta.arg)]);
          break;
        case "main/stopGenerationGroup/fulfilled":
          notificationMessage = messages(size(action.meta.arg)).STOP_GENERATION_GROUP;
          cancelAction = cancelStopGeneration(action.meta.arg);
          break;
        case "main/toggleDeleted":
          notificationMessage = prevValue.deleted ? messages().RESTORE : messages().DELETE;
          cancelAction = toggleDeleted(action.payload);
          break;
        case "main/toggleDeletedGroup":
          notificationMessage = prevValue[0].deleted ?
            messages(size(prevValue)).RESTORE_GROUP :
            messages(size(prevValue)).DELETE_GROUP;
          cancelAction = toggleDeletedGroup(
              prevValue.map((loc) => locators.find((_loc) => _loc.element_id === loc.element_id))
          );
          break;
        default:
          break;
      }
    }

    if (notificationMessage) openNotification();
  }, [lastNotification]);

  const cancelNotification = () => {
    dispatch(cancelLastNotification());
    dispatch(cancelAction);
  };

  const openNotification = () => {
    notification.destroy();

    if (notificationMessage !== "Action canceled." && lastNotification !== "Download") {
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

  return <div className="jdn__notification" />;
};
