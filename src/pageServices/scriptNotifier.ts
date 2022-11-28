import { Middleware } from "@reduxjs/toolkit";
import { compact, isNil, pick, size } from "lodash";
import { pageType } from "../common/constants/constants";
import { getEnumKeyByValue } from "../common/utils/helpersTS";
import { selectLocatorById } from "../features/locators/locatorSelectors";
import { ElementId, Locator, LocatorTaskStatus } from "../features/locators/locatorSlice.types";
import { selectLocatorsByPageObject } from "../features/pageObjects/pageObjectSelectors";
import { ElementLibrary, libraryClasses } from "../features/pageObjects/utils/generationClassesMap";
import { sendMessage } from "./connector";
import { selectCurrentPage } from "../app/mainSelectors";
import { RootState } from "../app/store";

const notify = (state: RootState, action: any, prevState: RootState) => {
  const { type, payload, meta } = action;
  switch (type) {
    case "pageObject/addLocatorsToPageObj": {
      if (isNil(state.pageObject.present.currentPageObject)) return;
      const locators = selectLocatorsByPageObject(state, state.pageObject.present.currentPageObject);
      locators && sendMessage.setHighlight({ elements: locators as Locator[]});
      break;
    }
    case "locators/changeLocatorAttributes": {
      const { element_id, validity, type: elementType, name, library } = payload;
      const prevValue = selectLocatorById(prevState, element_id);
      if (!prevValue) return;
      if (prevValue.type !== elementType || prevValue.name !== name) {
        const locator = selectLocatorById(state, element_id);
        locator && sendMessage.changeElementName(locator);
        const classes = libraryClasses[library as ElementLibrary];
        // if only I could know TS a little better
        /* eslint-disable-next-line */
        // @ts-ignore
        const label = getEnumKeyByValue(classes, elementType);
        sendMessage.assignDataLabels([{ jdnHash: locator?.jdnHash, predicted_label: label } as Locator]);
      } else if (prevValue?.validity?.locator.length) {
        // restore previously invalid locator
        const newValue = selectLocatorById(state, element_id);
        newValue && sendMessage.addElement(newValue);
      } else if (validity?.locator.length) {
        // delete invalid locator
        sendMessage.removeElement(prevValue);
      }
      break;
    }
    case "locators/generateLocators/pending": {
      const { predictedElements } = meta.arg;
      sendMessage.assignDataLabels(predictedElements);
      break;
    }
    case "main/changePage":
      if (selectCurrentPage(state).page === pageType.pageObject) sendMessage.killHighlight();
      break;
    case "main/changePageBack":
      if (selectCurrentPage(state).page === pageType.pageObject) sendMessage.killHighlight();
      break;
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
    case "locators/failGeneration": {
      const _payload = payload.map((element_id: string) => {
        const jdnHash = selectLocatorById(state, element_id)?.jdnHash;
        return { element_id, jdnHash, locator: { taskStatus: LocatorTaskStatus.FAILURE } };
      });
      _payload.forEach((element: Locator) => sendMessage.changeStatus(element));
      sendMessage.changeStatus(_payload);
      break;
    }
    case "filter/toggleClassFilter":
    case "filter/toggleClassFilterAll": {
      sendMessage.toggleFilter(pick(payload, ["jdiClass", "value"]));
    }
  }
};

export const scriptNotifier: Middleware = (store) => (next) => (action) => {
  const prevState = store.getState();
  const result = next(action);

  notify(store.getState(), action, prevState);
  return result;
};
