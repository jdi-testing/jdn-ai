import { useEffect } from "react";
import { removeOverlay, showOverlay } from "../../../pageServices/pageDataHandlers";

export const useOverlay = () => {
  useEffect(() => {
    return () => {
      removeOverlay();
    };
  }, []);
};
