import { useEffect } from "react";
import { connector } from "../services/connector";
import { useDispatch } from "react-redux";
import { clearAll } from "../store/slices/mainSlice";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { removeEmptyPageObjects } from "../store/thunks/removeEmptyPageObjects";
import { removeOverlay } from "../services/pageDataHandlers";

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
}