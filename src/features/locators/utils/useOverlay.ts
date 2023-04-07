import { useEffect } from "react";
import { removeOverlay } from "../../../pageServices/pageDataHandlers";

export const useOverlay = () => {
  useEffect(() => {
    return () => {
      removeOverlay();
    };
  }, []);
};
