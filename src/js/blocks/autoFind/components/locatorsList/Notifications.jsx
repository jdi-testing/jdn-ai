import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";
import { Button, notification } from "antd";
import {
  cancelLastNotification,
  changeElementName,
  handleLastNotification,
  stopXpathGeneration,
  stopXpathGenerationGroup,
  toggleDeleted,
  toggleDeletedGroup,
} from "../../redux/predictionSlice";
import { last, size } from "lodash";
import { selectLocators } from "../../redux/selectors";
import { revertSettings, runXpathGeneration } from "../../redux/thunks";

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
        case "main/changeElementName":
          notificationMessage = "Locator edited successfully!";
          debugger;
          const { element_id: id, name } = prevValue;
          cancelAction = changeElementName({ id, name });
          break;
        case "main/changeLocatorSettings":
          if (size(prevValue) === 1) notificationMessage = "Locator settings changed successfully!";
          else notificationMessage = `Settings of ${size(prevValue)} changed successfully!`;
          cancelAction = revertSettings({ payload: action.payload, prevValue });
          break;
        case "main/rerunGeneration/pending":
          const { arg } = action.meta;
          if (size(arg) === 1) {
            notificationMessage = "The locator generation rerunned successfully";
            cancelAction = stopXpathGeneration(arg[0].element_id);
          } else {
            notificationMessage = `Generation of ${length} rerunned successfully`;
            cancelAction = stopXpathGenerationGroup(arg);
          }
          break;
        case "main/stopXpathGeneration":
          cancelAction = runXpathGeneration([locators.find((_loc) => _loc.element_id === action.payload)]);
          notificationMessage = "The locator generation stopped successfully!";
          break;
        case "main/stopXpathGenerationGroup":
          cancelAction = runXpathGeneration(action.payload);
          notificationMessage = `Generation of ${size(action.payload)} locators stopped successfully!`;
          break;
        case "main/toggleDeleted":
          cancelAction = toggleDeleted(action.payload);
          if (prevValue.deleted) {
            notificationMessage = "The locator restored successfully!";
          } else {
            notificationMessage = "The locator deleted successfully!";
          }
          break;
        case "main/toggleDeletedGroup":
          cancelAction = toggleDeletedGroup(
              prevValue.map((loc) => locators.find((_loc) => _loc.element_id === loc.element_id))
          );
          if (prevValue[0].deleted) {
            notificationMessage = `${size(prevValue)} locators restored successfully!`;
          } else {
            notificationMessage = `${size(prevValue)} locators deleted successfully!`;
          }
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
