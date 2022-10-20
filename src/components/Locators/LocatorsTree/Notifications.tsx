import { AnyAction, AsyncThunkAction } from "@reduxjs/toolkit";
import { Alert, AlertProps, Button, notification } from "antd";
import { last, size } from "lodash";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import { selectLocators } from "../../../store/selectors/locatorSelectors";
import { Locator } from "../../../store/slices/locatorSlice.types";
import { RootState } from "../../../store/store";
import { cancelStopGeneration } from "../../../store/thunks/cancelStopGeneration";

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
    REMOVE_PO: "The page object was deleted",
    REMOVE_EMPTY: "Empty page objects were deleted",
    REMOVE_ALL: "Page objects were deleted",
    EDIT_PO_NAME: "The page object name was edited",
    DOWNLOAD_FILE: "The Java file was downloaded",
    DOWNLOAD_TEMPLATE: "The archive with template was downloaded",
    ACTION_CANCELLED: "Tha action was cancelled",
  };
};

const pageobjectUndo = { type: "PAGEOBJECT_UNDO" };
const locatorUndo = { type: "LOCATOR_UNDO" };
const locatorJump = (payload: number) => ({ type: "LOCATOR_JUMP", payload });

type UndoAction = typeof pageobjectUndo | typeof locatorUndo | typeof locatorJump;
type CancelAnyAction =
  | AsyncThunkAction<any, any, any>
  | AnyAction
  | Array<AsyncThunkAction<any, any, any> | AnyAction>
  | undefined;

export const Notifications = () => {
  const dispatch = useDispatch();
  const lastNotification = useSelector((state: RootState) => last(state.main.notifications));
  const locators = useSelector(selectLocators);

  useEffect(() => {
    if (!lastNotification) return;

    const { action, prevValue } = lastNotification;

    switch (action?.type) {
      case "locators/changeLocatorAttributes":
        openNotification(messages().EDITED, "success", locatorUndo);
        break;
      case "locators/rerunGeneration/pending":
        const { arg } = action.meta;
        const length = size(arg);
        if (length === 1) openNotification(messages().RERUN, "success", locatorUndo);
        else openNotification(messages(length.toString()).RERUN_GROUP, "success", locatorUndo);
        break;
      case "locators/stopGeneration/fulfilled":
        const _locator = locators.find((_loc) => _loc.element_id === action.meta.arg);
        const cancelAction = _locator && cancelStopGeneration([_locator]);
        openNotification(messages().STOP_GENERATION, "warning", cancelAction);
        break;
      case "locators/stopGenerationGroup/fulfilled":
        const _cancelAction = cancelStopGeneration(action.meta.arg);
        openNotification(messages(size(action.meta.arg).toString()).STOP_GENERATION_GROUP, "warning", _cancelAction);
        break;
      case "locators/toggleDeleted":
        const _prevValueLocator = prevValue as Locator;
        openNotification(
          _prevValueLocator.deleted ? messages().RESTORE : messages().DELETE,
          _prevValueLocator.deleted ? "success" : "warning",
          locatorUndo
        );
        break;
      case "locators/toggleDeletedGroup":
        const _prevValueGroup = prevValue as Array<Locator>;
        openNotification(
          _prevValueGroup[0].deleted ?
            messages(size(_prevValueGroup).toString()).RESTORE_GROUP :
            messages(size(_prevValueGroup).toString()).DELETE_GROUP,
          _prevValueGroup[0].deleted ? "success" : "warning",
          locatorUndo
        );
        break;
      case "pageObject/removeAll":
        openNotification(messages().REMOVE_ALL, "warning", [pageobjectUndo, locatorUndo]);
        break;
      case "pageObject/removePageObject":
        openNotification(messages().REMOVE_PO, "warning", [pageobjectUndo, locatorUndo]);
        break;
      case "pageObject/changeName":
        openNotification(messages().EDIT_PO_NAME, "success", pageobjectUndo);
        break;
      case "downloadFile":
        openNotification(messages().DOWNLOAD_FILE, "info");
        break;
      case "downloadTemplate":
        openNotification(messages().DOWNLOAD_TEMPLATE, "info");
        break;
      default:
        break;
    }
  }, [lastNotification]);

  const cancelNotification = (action: UndoAction | Array<UndoAction> | CancelAnyAction) => () => {
    if (Array.isArray(action)) {
      action.forEach((_action) => {
        dispatch(_action);
      });
    } else dispatch(action);
    openNotification(messages().ACTION_CANCELLED, "warning");
  };

  const openNotification = (
      message: string,
      type: AlertProps["type"],
      action?: UndoAction | Array<UndoAction> | CancelAnyAction
  ) => {
    notification.destroy();

    const cancelButton = action ? (
      <Button size="small" type="text" onClick={cancelNotification(action)}>
        Cancel
      </Button>
    ) : null;
    const container = document.body.querySelector(".jdn__notification") as HTMLElement;
    container &&
      notification.open({
        message: <Alert showIcon message={message} type={type} action={cancelButton} />,
        duration: 50000,
        getContainer: () => container,
        placement: "bottomRight",
      });
  };

  return <div className="jdn__notification" />;
};
