import { useEffect } from "react";
import { removeOverlay, showOverlay } from "../../../pageServices/pageDataHandlers";

export const useOverlay = (alreadyGenerated: boolean) => {
    useEffect(() => {
        if (alreadyGenerated) {
          showOverlay();
        }
        return () => {
          removeOverlay();
        };
      }, []);
}