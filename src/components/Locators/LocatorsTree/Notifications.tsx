import { AnyAction, AsyncThunkAction } from "@reduxjs/toolkit";
import { Alert, AlertProps, Button, notification } from "antd";
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
    EDITED: "The locator was edited",
    RERUN: "The locator generation rerun",
    RERUN_GROUP: `The generation of ${value} locators was rerun`,
    STOP_GENERATION: "The locator generation was stopped",
    STOP_GENERATION_GROUP: `The generation of ${value} locators was stopped`,
    DELETE: "The locator was deleted",
    DELETE_GROUP: `${value} locators were deleted`,
    RESTORE: "The locator was restored",
    RESTORE_GROUP: `${value} locators were restored`,
  };
};

export const Notifications = () => {
  const dispatch = useDispatch();
  const lastNotification = useSelector((state: RootState) => last(state.main.notifications));
  const locators = useSelector(selectLocators);
  const library = useSelector(selectCurrentPageObject)?.library;
  let notificationMessage = "";
  let notificationType: AlertProps["type"] = "success";
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
          const { isCustomName, ...rest } = prevValue as ChangeLocatorAttributesPayload;
          notificationMessage = messages().EDITED;
          notificationType = "success";
          cancelAction = changeLocatorAttributes({
            ...rest,
            isCustomName: isUndefined(isCustomName) ? false : true,
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
          notificationType = "success";
          break;
        case "locators/stopGeneration/fulfilled":
          notificationMessage = messages().STOP_GENERATION;
          notificationType = "warning";
          const _locator = locators.find((_loc) => _loc.element_id === action.meta.arg);
          cancelAction = _locator && cancelStopGeneration([_locator]);
          break;
        case "locators/stopGenerationGroup/fulfilled":
          notificationMessage = messages(size(action.meta.arg).toString()).STOP_GENERATION_GROUP;
          notificationType = "warning";
          cancelAction = cancelStopGeneration(action.meta.arg);
          break;
        case "locators/toggleDeleted":
          const _prevValueLocator = prevValue as Locator;
          notificationMessage = _prevValueLocator.deleted ? messages().RESTORE : messages().DELETE;
          notificationType = _prevValueLocator.deleted ? "success" : "warning";
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
          notificationType = _prevValueGroup[0].deleted ? "success" : "warning";
          const elements = _prevValueGroup.map((loc) => locators.find((_loc) => _loc.element_id === loc.element_id));
          const prevGenerateValues = _prevValueGroup.map((_loc) => ({ ..._loc, generate: !_loc.generate }));
          cancelAction = [toggleDeletedGroup(compact(elements)), toggleElementGroupGeneration(prevGenerateValues)];
          break;
        default:
          break;
      }
    }

    if (notificationMessage.length) openNotification();
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

    const cancelButton =
      notificationMessage !== "Action canceled." && cancelAction ? (
        <Button size="small" type="text" onClick={cancelNotification}>
          Cancel
        </Button>
      ) : null;
    const container = document.body.querySelector(".jdn__notification") as HTMLElement;
    container &&
      notification.open({
        message: (
          <Alert showIcon message={notificationMessage} type={notificationType} action={cancelButton} />
        ),
        duration: 10000,
        getContainer: () => container,
        placement: "bottomRight",
      });
  };

  return <div className="jdn__notification" />;
};
