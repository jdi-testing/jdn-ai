import { AlertProps } from "antd";
import { size } from "lodash";
import { useEffect, useRef } from "react";
import { Notification } from "../../../../app/types/mainSlice.types";
import { messages } from "./messages";
import { Action } from "../types/notification.types";
import { locatorUndo, pageobjectUndo } from "./undoActions";
import { Locator } from "../../../../features/locators/types/locator.types";

export const useNotificationController = (
  lastNotification: Notification | undefined,
  locators: Locator[],
  openNotification: (message: string, type: AlertProps["type"], action?: Action) => void
) => {
  const isMounted = useRef(false);

  useEffect(() => {
    if (!isMounted.current) {
      isMounted.current = true;
      return;
    }

    if (!lastNotification) return;

    const { action, prevValue } = lastNotification;

    switch (action?.type) {
      case "locators/changeLocatorAttributes":
      case "locators/changeLocatorElement/fulfilled":
        openNotification(messages().EDITED, "success", locatorUndo({ type: action?.type, payload: prevValue }));
        break;
      case "locators/rerunGeneration/fulfilled":
        const { arg } = action.meta;
        const length = size(arg.generationData);
        if (length === 1) openNotification(messages().RERUN, "success");
        else {
          openNotification(messages(length.toString()).RERUN_GROUP, "success");
        }
        break;
      case "locators/stopGeneration/fulfilled":
        openNotification(messages().STOP_GENERATION, "warning");
        break;
      case "locators/stopGenerationGroup/fulfilled":
        openNotification(messages(size(action.meta.arg).toString()).STOP_GENERATION_GROUP, "warning");
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
        const valueLength = size(_prevValueGroup);
        openNotification(
          _prevValueGroup[0].deleted
            ? messages(valueLength.toString())[valueLength === 1 ? "RESTORE" : "RESTORE_GROUP"]
            : messages(valueLength.toString())[valueLength === 1 ? "DELETE" : "DELETE_GROUP"],
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
