import { AlertProps } from "antd";
import { size } from "lodash";
import { useEffect } from "react";
import { Notification } from "../../../../app/types/mainSlice.types";
import { cancelStopGeneration } from "../reducers/cancelStopGeneration.thunk";
import { messages } from "./messages";
import { Action } from "../types/notification.types";
import { locatorUndo, pageobjectUndo } from "./undoActions";
import { Locator } from "../../../../features/locators/types/locator.types";
import { cancelRerun } from "../reducers/cancelRerun.thunk";

export const useNotificationController = (
  lastNotification: Notification | undefined,
  locators: Locator[],
  openNotification: (message: string, type: AlertProps["type"], action?: Action) => void
) => {
  useEffect(() => {
    if (!lastNotification) return;

    const { action, prevValue } = lastNotification;

    switch (action?.type) {
      case "locators/changeLocatorAttributes":
        openNotification(messages().EDITED, "success", locatorUndo({ type: action?.type, payload: prevValue }));
        break;
      case "locators/rerunGeneration/fulfilled":
        const { arg } = action.meta;
        const length = size(arg.generationData);
        const rerunCancelAction = cancelRerun(action.meta.arg);
        if (length === 1) openNotification(messages().RERUN, "success", rerunCancelAction);
        else {
          openNotification(messages(length.toString()).RERUN_GROUP, "success", rerunCancelAction); // create cancelRerun thunk
        }
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
          locatorUndo({ type: action?.type, payload: _prevValueLocator.element_id })
        );
        break;
      case "locators/toggleDeletedGroup":
        const _prevValueGroup = prevValue as Array<Locator>;
        openNotification(
          _prevValueGroup[0].deleted
            ? messages(size(_prevValueGroup).toString()).RESTORE_GROUP
            : messages(size(_prevValueGroup).toString()).DELETE_GROUP,
          _prevValueGroup[0].deleted ? "success" : "warning",
          locatorUndo({ type: action?.type, payload: _prevValueGroup })
        );
        break;
      case "pageObject/removeAll":
        openNotification(messages().REMOVE_ALL, "warning", [pageobjectUndo, locatorUndo()]);
        break;
      case "pageObject/removePageObject":
        openNotification(messages().REMOVE_PO, "warning", [pageobjectUndo, locatorUndo()]);
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
};
