import { Middleware } from "@reduxjs/toolkit";
import { compact, isNil, pick, size } from "lodash";
import { pageType } from "../common/constants/constants";
import { selectLocatorById } from "../features/locators/locators.selectors";
import { Locator, LocatorTaskStatus } from "../features/locators/types/locator.types";
import { selectLocatorsByPageObject } from "../features/pageObjects/pageObject.selectors";
import { sendMessage } from "./connector";
import { selectCurrentPage } from "../app/main.selectors";
import { RootState } from "../app/store/store";
import { PageType } from "../app/types/mainSlice.types";
import { selectClassFilterByPO } from "../features/filter/filter.selectors";

const notify = (state: RootState, action: any, prevState: RootState) => {
  let { type, payload } = action;
  const { meta } = action;
  if (type === "LOCATOR_UNDO") {
    type = payload?.type;
    payload = payload?.payload;
  }
  switch (type) {
    case "main/changePage":
      if (selectCurrentPage(state).page === pageType.pageObject) sendMessage.killHighlight();
      break;
    case "main/changePageBack":
      if (selectCurrentPage(state).page === pageType.pageObject) sendMessage.killHighlight();
      break;
  }

  const noHighlight =
    selectCurrentPage(state).alreadyGenerated || selectCurrentPage(state).page === PageType.PageObject;
  if (noHighlight) return;

  switch (type) {
    case "pageObject/addLocatorsToPageObj": {
      if (isNil(state.pageObject.present.currentPageObject)) return;
      const locators = selectLocatorsByPageObject(state);
      const filter = selectClassFilterByPO(state);
      locators && sendMessage.setHighlight({ elements: locators as Locator[], filter });
      break;
    }
    case "locators/changeLocatorAttributes": {
      const { element_id, validity, type: elementType, name } = payload;
      const prevValue = selectLocatorById(prevState, element_id);
      if (!prevValue) return;
      if (prevValue.type !== elementType || prevValue.name !== name) {
        const locator = selectLocatorById(state, element_id);
        locator && sendMessage.changeElementName(locator);
      } else if (prevValue?.validity?.message.length) {
        // restore previously invalid locator
        const newValue = selectLocatorById(state, element_id);
        newValue && sendMessage.addElement(newValue);
      } else if (validity?.message.length) {
        // delete invalid locator
        sendMessage.removeElement(prevValue);
      }
      break;
    }
    case "locators/setActiveSingle": {
      const locators = selectLocatorsByPageObject(state);
      locators && sendMessage.toggleActiveGroup(locators);
      break;
    }
    case "locators/elementSetActive": {
      const locator = selectLocatorById(state, payload);
      locator && sendMessage.setActive(locator);
      break;
    }
    case "locators/generateLocators/pending": {
      const { predictedElements } = meta.arg;
      sendMessage.assignDataLabels(predictedElements);
      break;
    }
    case "locators/stopGeneration/fulfilled": {
      const locator = selectLocatorById(state, meta.arg);
      locator && sendMessage.changeStatus(locator);
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
      const element = selectLocatorById(state, typeof payload === "string" ? payload : payload.element_id);
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
      payload.locators.forEach((_loc: Locator) => {
        const element = selectLocatorById(state, _loc.element_id);
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
    case "locators/failGeneration": {
      const _payload = payload.map((element_id: string) => {
        const jdnHash = selectLocatorById(state, element_id)?.jdnHash;
        return { element_id, jdnHash, locator: { taskStatus: LocatorTaskStatus.FAILURE } };
      });
      _payload.forEach((element: Locator) => sendMessage.changeStatus(element));
      sendMessage.changeStatus(_payload);
      break;
    }
    case "locators/elementUnsetActive":
      const locator = selectLocatorById(state, payload);
      if (locator) sendMessage.unsetActive(locator);
      break;
    case "locators/elementGroupUnsetActive": {
      if (!payload.fromScript) sendMessage.unsetActive(payload);
      break;
    }
    case "filter/toggleClassFilter":
    case "filter/toggleClassFilterAll": {
      sendMessage.toggleFilter(pick(payload, ["jdiClass", "value"]));
      break;
    }
  }
};

export const scriptNotifier: Middleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);

  notify(store.getState(), action, prevState);
  return result;
};
