import { useEffect } from "react";
import { useDispatch } from "react-redux";
import { removeEmptyPageObjects } from "../common/thunks/removeEmptyPageObjects";
import { locatorGenerationController } from "../features/locators/locatorGenerationController";
import { connector } from "../pageServices/connector";
import { removeOverlay } from "../pageServices/pageDataHandlers";
import { clearAll } from "./mainSlice";

export const useOnTabUpdate = () => {
  const dispatch = useDispatch();

  useEffect(() => {
    connector.onTabUpdate(() => {
      dispatch(clearAll());
      locatorGenerationController.revokeAll();
      dispatch(removeEmptyPageObjects());
      removeOverlay();
      connector.attachStaticScripts();
    });
  }, []);
};
