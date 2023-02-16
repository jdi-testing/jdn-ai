import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { removeEmptyPageObjects } from "../../features/pageObjects/reducers/removeEmptyPageObjects.thunk";
import { locatorGenerationController } from "../../features/locators/utils/locatorGenerationController";
import { connector } from "../../pageServices/connector";
import { removeOverlay } from "../../pageServices/pageDataHandlers";
import { clearAll } from "../main.slice";

export const useOnTabUpdate = (onScriptsInited: () => Promise<void>) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const disconnectHandler = () => {
      dispatch(clearAll());
      locatorGenerationController.revokeAll();
      dispatch(removeEmptyPageObjects());
      removeOverlay();
    }

    connector.initScripts(onScriptsInited, disconnectHandler);
  }, []);
};
