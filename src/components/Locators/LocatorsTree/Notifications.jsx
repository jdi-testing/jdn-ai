import { Button, notification } from "antd";
import { isUndefined, last, size } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import React, { useEffect } from "react";

import {
  changeLocatorAttributes,
  toggleDeleted,
  toggleDeletedGroup,
  toggleElementGeneration,
  toggleElementGroupGeneration,
} from "../../../store/slices/locatorsSlice";
import { selectLocators } from "../../../store/selectors/locatorSelectors";
import { stopGeneration } from "../../../store/thunks/stopGeneration";
import { stopGenerationGroup } from "../../../store/thunks/stopGenerationGroup";
import { cancelStopGeneration } from "../../../store/thunks/cancelStopGeneration";
import { cancelLastNotification, handleLastNotification } from "../../../store/slices/mainSlice";
import { selectPageObjById } from "../../../store/selectors/pageObjectSelectors";

const messages = (value) => {
  return {
    EDITED: "Locator edited successfully!",
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
  const library = useSelector((_state) => selectPageObjById(_state, _state.pageObject.currentPageObject)).library;
  let notificationMessage = "";
  let cancelAction;

  useEffect(() => {
    if (!lastNotification) return;

    const { isCanceled, isHandled, action, prevValue } = lastNotification;

    if (isCanceled && isHandled) return;
    if (isCanceled && !isHandled) {
      notificationMessage = "Action canceled.";
      dispatch(handleLastNotification());
    } else {
      switch (action?.type) {
        case "locators/changeLocatorAttributes":
          const { element_id, type, name, locator, validity, isCustomName } = prevValue;
          notificationMessage = messages().EDITED;
          cancelAction = changeLocatorAttributes({
            type,
            name,
            isCustomName: isUndefined(isCustomName) ? false : true,
            element_id,
            locator: locator.customXpath,
            validity,
            library,
          });
          break;
        case "locators/rerunGeneration/pending":
          const { arg } = action.meta;
          const length = size(arg);
          if (length === 1) {
            notificationMessage = messages().RERUN;
            cancelAction = stopGeneration(arg[0].element_id);
          } else {
            notificationMessage = messages(length).RERUN_GROUP;
            cancelAction = stopGenerationGroup(arg);
          }
          break;
        case "locators/stopGeneration/fulfilled":
          notificationMessage = messages().STOP_GENERATION;
          cancelAction = cancelStopGeneration([locators.find((_loc) => _loc.element_id === action.meta.arg)]);
          break;
        case "locators/stopGenerationGroup/fulfilled":
          notificationMessage = messages(size(action.meta.arg)).STOP_GENERATION_GROUP;
          cancelAction = cancelStopGeneration(action.meta.arg);
          break;
        case "locators/toggleDeleted":
          notificationMessage = prevValue.deleted ? messages().RESTORE : messages().DELETE;
          cancelAction = [
            toggleDeleted(action.payload),
            toggleElementGeneration({ ...prevValue, generate: !prevValue.generate }),
          ];
          break;
        case "locators/toggleDeletedGroup":
          notificationMessage = prevValue[0].deleted ?
            messages(size(prevValue)).RESTORE_GROUP :
            messages(size(prevValue)).DELETE_GROUP;
          const elements = prevValue.map((loc) => locators.find((_loc) => _loc.element_id === loc.element_id));
          const prevGenerateValues = prevValue.map((_loc) => ({ ..._loc, generate: !_loc.generate }));
          cancelAction = [toggleDeletedGroup(elements), toggleElementGroupGeneration(prevGenerateValues)];
          break;
        default:
          break;
      }
    }

    if (notificationMessage) openNotification();
  }, [lastNotification]);

  const cancelNotification = () => {
    dispatch(cancelLastNotification());
    if (Array.isArray(cancelAction)) {
      cancelAction.forEach((action) => {
        dispatch(action);
      });
    } else dispatch(cancelAction);
  };

  const openNotification = () => {
    notification.destroy();

    if (notificationMessage !== "Action canceled.") {
      const btn = (
        <Button type="primary" size="small" className="jdn__notification-close-btn" onClick={cancelNotification}>
          Cancel
        </Button>
      );
      notification.open({
        message: notificationMessage,
        duration: 10,
        getContainer: () => document.body.querySelector(".jdn__notification"),
        btn,
      });
    } else {
      notification.open({
        message: notificationMessage,
        duration: 10,
        getContainer: () => document.body.querySelector(".jdn__notification"),
      });
    }
  };

  return <div className="jdn__notification" />;
};
