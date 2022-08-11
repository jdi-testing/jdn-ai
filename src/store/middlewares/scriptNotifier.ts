import { Middleware } from "@reduxjs/toolkit";
import { compact, isNil, size } from "lodash";
import { sendMessage } from "../../services/connector";
import { pageType } from "../../utils/constants";
import { isErrorValidationType } from "../../utils/helpers";
import { selectLocatorById } from "../selectors/locatorSelectors";
import { selectCurrentPage } from "../selectors/mainSelectors";
import { selectLocatorsByPageObject } from "../selectors/pageObjectSelectors";
import { ElementId, Locator } from "../slices/locatorSlice.types";
import { RootState } from "../store";

const notify = (state: RootState, action: any, prevState: RootState) => {
    const { type, payload, meta } = action;
    switch (type) {
        case "pageObject/addLocatorsToPageObj": {
            if (isNil(state.pageObject.currentPageObject)) return;
            const locators = selectLocatorsByPageObject(state, state.pageObject.currentPageObject);
            locators && sendMessage.setHighlight({ elements: locators as Locator[], perception: state.main.perception });
            break;
        }
        case "locators/changeLocatorAttributes": {
            const { element_id, validity, type, name } = payload;
            const prevValue = selectLocatorById(prevState, element_id);
            if (!prevValue) return;
            if (prevValue.type !== type || prevValue.name !== name) {
                const locator = selectLocatorById(state, element_id);
                locator && sendMessage.changeElementName(locator);
            } else if (isErrorValidationType(prevValue?.validity?.locator)) {
                // restore previously invalid locator
                const newValue = selectLocatorById(state, element_id);
                newValue && sendMessage.addElement(newValue);
            } else if (isErrorValidationType(validity?.locator)) {
                // delete invalid locator
                sendMessage.removeElement(prevValue);
            }
            break;
        }
        case "main/changePage":
            if (selectCurrentPage(state).page === pageType.pageObject) sendMessage.killHighlight();
            break;
        case "main/changePageBack":
            if (selectCurrentPage(state).page === pageType.pageObject) sendMessage.killHighlight();
            break;
        case "main/changePerception":
            sendMessage.setHighlight({ perception: payload });
            break;
        case "locators/stopGeneration/fulfilled": {
            const locator = selectLocatorById(state, meta.arg);
            locator &&
                sendMessage.changeStatus(locator);
            break;
        }
        case "locators/stopGenerationGroup/fulfilled": {
            const _arr: Locator[] = compact(payload);
            _arr.forEach((element) => {
                const { element_id } = element;
                const locator = selectLocatorById(state, element_id);
                locator && sendMessage.changeStatus(locator);
            });
            break;
        }
        case "locators/toggleElementGeneration": {
            const element = selectLocatorById(state, payload);
            element && sendMessage.toggle({ element });
            break;
        }
        case "locators/toggleElementGroupGeneration":
            payload.forEach((element: Locator) => {
                const locator = selectLocatorById(state, element.element_id);
                locator && sendMessage.toggle({ element: locator, skipScroll: true });
            });
            break;
        case "locators/setChildrenGeneration": {
            const { locator } = payload;
            const iterateChildren = (_locator: Locator | undefined) => {
                _locator?.children &&
                    _locator.children.forEach((childId) => {
                        const child = selectLocatorById(state, childId);
                        child && sendMessage.toggle({ element: child, skipScroll: true });
                        if (size(child?.children)) iterateChildren(child);
                    });
            };
            iterateChildren(locator);
            break;
        }
        case "locators/setElementGroupGeneration":
            payload.ids.forEach((id: ElementId) => {
                const element = selectLocatorById(state, id);
                element && sendMessage.toggle({ element, skipScroll: true });
            });
            break;
        case "locators/toggleDeleted": {
            const locator = selectLocatorById(state, payload);
            locator && sendMessage.toggleDeleted(locator);
            break;
        }
        case "locators/toggleDeletedGroup":
            payload.forEach((element: Locator) => {
                const locator = selectLocatorById(state, element.element_id);
                locator && sendMessage.toggleDeleted(locator);
            });
            break;
        case "locators/updateLocator":
            sendMessage.changeStatus(payload);
            break;
    }
};

export const scriptNotifier: Middleware = (store) => (next) => (action) => {
    const prevState = store.getState();
    const result = next(action);

    notify(store.getState(), action, prevState);
    return result;
};