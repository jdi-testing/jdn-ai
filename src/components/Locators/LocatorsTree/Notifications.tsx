import { AnyAction, AsyncThunkAction } from "@reduxjs/toolkit";
import { Button, notification } from "antd";
import { compact, isUndefined, last, size } from "lodash";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectLocators } from "../../../store/selectors/locatorSelectors";
import { selectCurrentPageObject } from "../../../store/selectors/pageObjectSelectors";
import { Locator } from "../../../store/slices/locatorSlice.types";
import {
  changeLocatorAttributes,
  ChangeLocatorAttributesPayload,
  toggleDeleted,
  toggleDeletedGroup,
  toggleElementGeneration,
  toggleElementGroupGeneration,
} from "../../../store/slices/locatorsSlice";
import { cancelLastNotification, handleLastNotification } from "../../../store/slices/mainSlice";
import { RootState } from "../../../store/store";
import { cancelStopGeneration } from "../../../store/thunks/cancelStopGeneration";
import { defaultLibrary } from "../../PageObjects/utils/generationClassesMap";

const messages = (value?: string) => {
  return {
    EDITED: "Locator edited successfully!",
    RERUN: "The locator generation re-runned successfully",
    RERUN_GROUP: `Generation of ${value} locators re-runned successfully`,
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
  const lastNotification = useSelector((state: RootState) => last(state.main.notifications));
  const locators = useSelector(selectLocators);
  const library = useSelector(selectCurrentPageObject)?.library;
  let notificationMessage = "";
  let cancelAction:
    | AsyncThunkAction<any, any, any>
    | AnyAction
    | Array<AsyncThunkAction<any, any, any> | AnyAction>
    | undefined;

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
          const {
            element_id,
            type,
            name,
            locator,
            validity,
            isCustomName,
          } = (prevValue as unknown) as ChangeLocatorAttributesPayload;
          notificationMessage = messages().EDITED;
          cancelAction = changeLocatorAttributes({
            type,
            name,
            isCustomName: isUndefined(isCustomName) ? false : true,
            element_id,
            locator: locator,
            validity,
            library: library || defaultLibrary,
          });
          break;
        case "locators/rerunGeneration/pending":
          const { arg } = action.meta;
          const length = size(arg);
          if (length === 1) {
            notificationMessage = messages().RERUN;
          } else {
            notificationMessage = messages(length.toString()).RERUN_GROUP;
          }
          break;
        case "locators/stopGeneration/fulfilled":
          notificationMessage = messages().STOP_GENERATION;
          const _locator = locators.find((_loc) => _loc.element_id === action.meta.arg);
          cancelAction = _locator && cancelStopGeneration([_locator]);
          break;
        case "locators/stopGenerationGroup/fulfilled":
          notificationMessage = messages(size(action.meta.arg).toString()).STOP_GENERATION_GROUP;
          cancelAction = cancelStopGeneration(action.meta.arg);
          break;
        case "locators/toggleDeleted":
          const _prevValueLocator = prevValue as Locator;
          notificationMessage = (_prevValueLocator).deleted ? messages().RESTORE : messages().DELETE;
          cancelAction = [
            toggleDeleted(action.payload),
            toggleElementGeneration({ ..._prevValueLocator, generate: !_prevValueLocator.generate } as Locator),
          ];
          break;
        case "locators/toggleDeletedGroup":
          const _prevValueGroup = prevValue as Array<Locator>;
          notificationMessage = _prevValueGroup[0].deleted ?
            messages(size(_prevValueGroup).toString()).RESTORE_GROUP :
            messages(size(_prevValueGroup).toString()).DELETE_GROUP;
          const elements = _prevValueGroup.map((loc) => locators.find((_loc) => _loc.element_id === loc.element_id));
          const prevGenerateValues = _prevValueGroup.map((_loc) => ({ ..._loc, generate: !_loc.generate }));
          cancelAction = [toggleDeletedGroup(compact(elements)), toggleElementGroupGeneration(prevGenerateValues)];
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

    // if (notificationMessage !== "Action canceled." && cancelAction) {
    const cancelButton = (
      <Button type="primary" size="small" className="jdn__notification-close-btn" onClick={cancelNotification}>
        Cancel
      </Button>
    );
    const container = document.body.querySelector(".jdn__notification") as HTMLElement;
    container &&
      notification.open({
        message: notificationMessage,
        duration: 10,
        getContainer: () => container,
        btn: notificationMessage !== "Action canceled." && cancelAction ? cancelButton : null,
      });
  };

  return <div className="jdn__notification" />;
};
