import { Middleware } from '@reduxjs/toolkit';
import { compact, isNil, size } from 'lodash';
import { selectLocatorById, selectLocatorByJdnHash } from '../features/locators/selectors/locators.selectors';
import { ILocator, LocatorTaskStatus, LocatorValidationWarnings } from '../features/locators/types/locator.types';
import { sendMessage } from './connector';
import { selectCurrentPage } from '../app/main.selectors';
import { RootState } from '../app/store/store';
import { PageType } from '../app/types/mainSlice.types';
import { selectClassFilterByPO } from '../features/filter/filter.selectors';
import { selectPresentLocatorsByPO, selectValidLocators } from '../features/locators/selectors/locatorsByPO.selectors';
import { isPageObjectPage } from '../app/utils/helpers';

const notify = (state: RootState, action: any, prevState: RootState) => {
  let { type, payload } = action;
  const { meta } = action;
  if (type === 'LOCATOR_UNDO') {
    type = payload?.type;
    payload = payload?.payload;
  }
  switch (type) {
    case 'main/changePage':
    case 'main/changePageBack':
    case 'main/clearAll':
      const page = selectCurrentPage(state);
      if (isPageObjectPage(page.page)) sendMessage.killHighlight();
      break;
  }

  const noHighlight = selectCurrentPage(state).page === PageType.PageObject;
  if (noHighlight) return;

  switch (type) {
    case 'pageObject/addLocatorsToPageObj': {
      if (isNil(state.pageObject.present.currentPageObject)) return;
      const locators = selectValidLocators(state);
      const filter = selectClassFilterByPO(state);
      locators && sendMessage.setHighlight({ elements: locators as ILocator[], filter });
      break;
    }
    case 'pageObject/addLocatorToPageObj': {
      if (isNil(state.pageObject.present.currentPageObject)) return;
      const { locatorId } = payload;
      const locator = selectLocatorById(state, locatorId);
      locator && !locator?.message && sendMessage.addElement(locator);
      break;
    }
    case 'locators/checkLocatorsValidity/fulfilled': {
      const locators = selectValidLocators(state);
      const filter = selectClassFilterByPO(state);
      locators && sendMessage.setHighlight({ elements: locators as ILocator[], filter, isAlreadyGenerated: true });
      break;
    }
    case 'locators/changeLocatorAttributes':
    case 'locators/changeLocatorElement/fulfilled': {
      const { element_id, message, type: elementType, name } = payload;
      const prevValue = selectLocatorById(prevState, element_id);
      const newValue = selectLocatorById(state, element_id);

      if (!prevValue) return;

      if (message?.length && message !== LocatorValidationWarnings.NewElement) {
        sendMessage.removeElement(prevValue);
      } else {
        if (!prevValue?.message?.length || prevValue?.message === LocatorValidationWarnings.NewElement) {
          sendMessage.removeElement(prevValue);
        }

        newValue && sendMessage.addElement(newValue);

        if (prevValue.type !== elementType || prevValue.name !== name) {
          newValue && sendMessage.changeElementName(newValue);
        }
      }
      break;
    }
    case 'locators/elementSetActive':
    case 'locators/setActiveSingle': {
      const locators = selectPresentLocatorsByPO(state);
      locators && sendMessage.toggleActiveGroup(locators);
      break;
    }
    case 'locators/generateLocators/pending': {
      const { predictedElements } = meta.arg;
      sendMessage.assignDataLabels(predictedElements);
      break;
    }
    case 'locators/stopGeneration/fulfilled': {
      const locator = selectLocatorById(state, meta.arg);
      locator && sendMessage.changeStatus(locator);
      break;
    }
    case 'locators/stopGenerationGroup/fulfilled': {
      const _arr: ILocator[] = compact(payload);
      _arr.forEach((element) => {
        const { element_id } = element;
        const locator = selectLocatorById(state, element_id);
        locator && sendMessage.changeStatus(locator);
      });
      break;
    }
    case 'locators/toggleElementGeneration': // ToDo isGenerated refactoring
    case 'locators/toggleLocatorIsChecked': {
      const element = selectLocatorById(state, typeof payload === 'string' ? payload : payload.element_id);
      element && sendMessage.toggle({ element });
      break;
    }
    case 'locators/toggleElementGroupGeneration':
      payload.forEach((element: ILocator) => {
        const locator = selectLocatorById(state, element.element_id);
        locator && sendMessage.toggle({ element: locator, skipScroll: true });
      });
      break;
    case 'locators/toggleElementGroupIsChecked':
      payload.forEach((element: ILocator) => {
        const locator = selectLocatorById(state, element.element_id);
        locator && sendMessage.toggle({ element: locator, skipScroll: true });
      });
      break;
    case 'locators/setChildrenGeneration': // ToDo isGenerated refactoring
    case 'locators/setChildrenIsChecked': {
      const { locator } = payload;
      const iterateChildren = (_locator: ILocator | undefined) => {
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
    case 'locators/setElementGroupGeneration':
      payload.locators.forEach((_loc: ILocator) => {
        const element = selectLocatorById(state, _loc.element_id);
        element && sendMessage.toggle({ element, skipScroll: true });
      });
      break;
    case 'locators/toggleDeleted': {
      const locator = selectLocatorById(state, payload);
      locator && sendMessage.toggleDeleted(locator);
      break;
    }
    case 'locators/toggleDeletedGroup':
      payload.forEach((element: ILocator) => {
        const locator = selectLocatorById(state, element.element_id);
        locator && sendMessage.toggleDeleted(locator);
      });
      break;
    case 'locators/updateLocatorGroup':
      payload.locators.forEach(({ element_id, jdnHash }: ILocator) => {
        const locator = element_id ? selectLocatorById(state, element_id) : selectLocatorByJdnHash(state, jdnHash);
        locator && sendMessage.changeStatus(locator);
      });
      break;
    case 'locators/failGeneration': {
      const { ids } = payload;
      const elements = ids.map((element_id: string) => {
        const jdnHash = selectLocatorById(state, element_id)?.jdnHash;
        return {
          element_id,
          jdnHash,
          locatorValue: { xPathStatus: LocatorTaskStatus.FAILURE, cssSelectorStatus: LocatorTaskStatus.FAILURE },
        } as ILocator;
      });
      elements.forEach((element: ILocator) => sendMessage.changeStatus(element));
      break;
    }
    case 'locators/elementUnsetActive':
      const locator = selectLocatorById(state, payload);
      if (locator) sendMessage.unsetActive(locator);
      break;
    case 'locators/elementGroupUnsetActive': {
      if (!payload.fromScript) sendMessage.unsetActive(payload);
      break;
    }
    case 'filter/setFilters': {
      const newFilter = selectClassFilterByPO(state);
      sendMessage.toggleFilter(newFilter);
      break;
    }
    case 'filter/toggleClassFilter/fulfilled':
    case 'filter/toggleClassFilterAll/fulfilled': {
      sendMessage.toggleFilter(payload.newFilter);
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
