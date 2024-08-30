import type { PayloadAction } from '@reduxjs/toolkit';
import { createSlice } from '@reduxjs/toolkit';
import { size } from 'lodash';
import { ElementClass, ElementLibrary } from './types/generationClasses.types';
import {
  locatorsAdapter,
  simpleSelectLocatorById,
  simpleSelectLocatorByJdnHash,
  simpleSelectLocatorsByPageObject,
} from './selectors/locators.selectors';
import { createLocatorsReducer } from './reducers/createLocators.thunk';
import { identifyElementsReducer } from './reducers/identifyElements.thunk';
import { rerunGenerationReducer } from './reducers/rerunGeneration.thunk';
import { stopGenerationReducer } from './reducers/stopGeneration.thunk';
import { stopGenerationGroupReducer } from './reducers/stopGenerationGroup.thunk';
import {
  ElementId,
  IdentificationStatus,
  ILocator,
  IPartialLocatorDataForUpdate,
  LocatorCalculationPriority,
  LocatorsGenerationStatus,
  LocatorsState,
  LocatorTaskStatus,
  LocatorValidationErrorType,
  LocatorValidationWarnings,
} from './types/locator.types';
import { checkLocatorsValidityReducer } from './reducers/checkLocatorValidity.thunk';
import { LocatorType } from '../../common/types/common';
import { addCustomLocatorReducer } from './reducers/addCustomLocator.thunk';
import { changeLocatorElementReducer } from './reducers/changeLocatorElement.thunk';
import { DEFAULT_ERROR, NETWORK_ERROR } from './utils/constants';
import { runLocatorsGenerationReducer } from './reducers/runLocatorsGeneration.thunk';
import { PageObject } from '../pageObjects/types/pageObjectSlice.types';

const initialState: LocatorsState = {
  generationStatus: LocatorsGenerationStatus.noStatus,
  status: IdentificationStatus.noStatus,
  scrollToLocator: null,
  expandedKeys: [],
  autoExpandParent: true,
};

export interface ChangeLocatorAttributesPayload {
  elementId: ElementId;
  type: ElementClass;
  name: string;
  locatorValue: string;
  message: LocatorValidationErrorType;
  library: ElementLibrary;
  isCustomName?: boolean;
  isGeneratedName?: boolean;
  locatorType: LocatorType;
  isCurrentFrameworkVividus?: boolean;
}

const locatorsSlice = createSlice({
  name: 'locators',
  initialState: locatorsAdapter.getInitialState(initialState),
  reducers: {
    addLocators(state, { payload }) {
      locatorsAdapter.addMany(state, payload);
      state.status = IdentificationStatus.success;
    },
    changeLocatorAttributes(state, { payload }: PayloadAction<ChangeLocatorAttributesPayload>) {
      const { locatorValue, elementId, locatorType, ...rest } = payload;

      const currentLocator = simpleSelectLocatorById(state, elementId);

      if (!currentLocator) return;

      const newValue: ILocator = {
        ...currentLocator,
        locatorValue: { ...currentLocator.locatorValue },
        locatorType,
        ...rest,
      };
      const isStandardLocator: boolean =
        [
          LocatorType.cssSelector,
          LocatorType.className,
          LocatorType.id,
          LocatorType.linkText,
          LocatorType.name,
          LocatorType.tagName,
        ].includes(locatorType) || locatorType.startsWith('data-');

      if (locatorType === LocatorType.cssSelector) {
        newValue.locatorValue.cssSelector = locatorValue;
      } else if (locatorType === LocatorType.xPath) {
        newValue.locatorValue.xPath = locatorValue;
      } else if (isStandardLocator) {
        if (locatorType === LocatorType.dataAttributes || locatorType.startsWith('data-')) {
          newValue.locatorValue.attributes = {
            ...newValue.locatorValue.attributes,
            dataAttributes: { ...(newValue.locatorValue.attributes?.dataAttributes || {}) },
          }; // unfreeze object

          if (newValue.locatorValue.attributes.dataAttributes) {
            newValue.locatorValue.attributes.dataAttributes[locatorType] = locatorValue;
          }
        } else {
          const attributes = { ...newValue.locatorValue.attributes }; // unfreeze object
          attributes[locatorType] = locatorValue;
          newValue.locatorValue.attributes = attributes;
        }
      }

      if (rest.message === LocatorValidationWarnings.NotFound) {
        newValue.jdnHash = '';
      }
      locatorsAdapter.upsertOne(state, newValue);
    },
    changeIdentificationStatus(state, { payload }: PayloadAction<IdentificationStatus>) {
      state.status = payload;
    },
    elementGroupSetActive(
      state,
      { payload }: PayloadAction<ILocator[] | { locators: ILocator[]; fromScript: boolean }>,
    ) {
      const locators = Array.isArray(payload) ? payload : payload.locators;
      locatorsAdapter.upsertMany(state, locators.map(({ elementId }) => ({ elementId, active: true })) as ILocator[]);
    },
    elementGroupUnsetActive(
      state,
      { payload }: PayloadAction<ILocator[] | { locators: ILocator[]; fromScript: boolean }>,
    ) {
      const locators = Array.isArray(payload) ? payload : payload.locators;
      const newValue = locators.map(({ elementId }) => ({ elementId, active: false }));
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    elementSetActive(state, { payload }: PayloadAction<ILocator>) {
      locatorsAdapter.upsertOne(state, { elementId: payload.elementId, active: true } as ILocator);
    },
    elementUnsetActive(state, { payload }: PayloadAction<ElementId>) {
      locatorsAdapter.upsertOne(state, { elementId: payload, active: false } as ILocator);
    },
    failGeneration(state, { payload }: PayloadAction<{ ids: string[]; errorMessage?: string }>) {
      const { ids, errorMessage } = payload;
      console.error('NETWORK ERROR: ', errorMessage);
      if (errorMessage === NETWORK_ERROR) state.generationStatus = LocatorsGenerationStatus.failed;
      const newValues = ids.map((elementId) => {
        const existingLocator = simpleSelectLocatorById(state, elementId);
        if (existingLocator) {
          return {
            elementId,
            locatorValue: {
              ...existingLocator.locatorValue,
              xPathStatus: LocatorTaskStatus.FAILURE,
              errorMessage: errorMessage || DEFAULT_ERROR,
            },
          } as ILocator;
        }
        return null;
      });
      locatorsAdapter.upsertMany(state, newValues.filter((value) => value) as ILocator[]);
    },
    removeAll(state) {
      locatorsAdapter.removeAll(state);
    },
    removeLocators(state, { payload: ids }) {
      if (ids) locatorsAdapter.removeMany(state, ids);
    },
    restoreLocators(state, { payload: locators }) {
      locatorsAdapter.setMany(state, locators);
    },
    setActiveSingle(state, { payload: locator }: PayloadAction<ILocator>) {
      const newValue = simpleSelectLocatorsByPageObject(state, locator.pageObj).map((_loc) =>
        _loc.elementId === locator.elementId ? { ..._loc, active: true } : { ..._loc, active: false },
      );
      locatorsAdapter.upsertMany(state, newValue);
    },
    setCalculationPriority(
      state,
      { payload }: PayloadAction<{ elementId?: ElementId; priority: LocatorCalculationPriority; ids?: ElementId[] }>,
    ) {
      const { elementId, ids, priority } = payload;
      if (elementId) locatorsAdapter.upsertOne(state, { elementId, priority } as ILocator);
      if (ids) {
        // TODO: fix legacy naming
        // eslint-disable-next-line @typescript-eslint/no-shadow
        const newValue: Partial<ILocator>[] = ids.map((elementId) => ({ elementId, priority }));
        locatorsAdapter.upsertMany(state, newValue as ILocator[]);
      }
    },
    setChildrenGeneration(state, { payload }: PayloadAction<{ locator: ILocator; isGenerated: boolean }>) {
      // ToDo isGenerated refactoring
      const { locator, isGenerated } = payload;
      const newValue: Partial<ILocator>[] = [];
      const toggleGenerate = (_locator: ILocator) => {
        if (_locator.children)
          _locator.children.forEach((childId) => {
            newValue.push({ elementId: childId, isGenerated });
            const child = simpleSelectLocatorById(state, childId);
            if (child && size(child.children)) toggleGenerate(child);
          });
      };
      toggleGenerate(locator);
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    setChildrenIsChecked(state, { payload }: PayloadAction<{ locator: ILocator; isChecked: boolean }>) {
      const { locator, isChecked } = payload;
      const newValue: Partial<ILocator>[] = [];
      const toggleIsChecked = (_locator: ILocator) => {
        if (_locator.children)
          _locator.children.forEach((childId) => {
            newValue.push({ elementId: childId, isChecked });
            const child = simpleSelectLocatorById(state, childId);
            if (child && size(child.children)) toggleIsChecked(child);
          });
      };
      toggleIsChecked(locator);
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    setElementGroupGeneration(state, { payload }: PayloadAction<{ locators: ILocator[]; isGenerated: boolean }>) {
      const { locators, isGenerated } = payload;
      locatorsAdapter.upsertMany(state, locators.map(({ elementId }) => ({ elementId, isGenerated })) as ILocator[]);
    },
    setJdnHash(state, { payload }: PayloadAction<{ elementId: ElementId; jdnHash: string }>) {
      const { elementId, jdnHash } = payload;
      locatorsAdapter.upsertOne(state, { elementId, jdnHash } as ILocator);
    },
    setScrollToLocator(state, { payload: elementId }: PayloadAction<ElementId>) {
      state.scrollToLocator = elementId;
    },
    setValidity(state, { payload }: PayloadAction<{ elementId: ElementId; message: ILocator['message'] }>) {
      locatorsAdapter.upsertOne(state, payload as ILocator);
    },
    toggleDeleted(state, { payload }: PayloadAction<string>) {
      const locator = simpleSelectLocatorById(state, payload);
      if (locator)
        locatorsAdapter.upsertOne(state, {
          ...locator,
          deleted: !locator.deleted,
          // when we delete locator, we uncheck it, when restore - keep isGenerated state as is
          isGenerated: !locator.deleted ? false : locator.isGenerated,
        });
    },
    toggleDeletedGroup(state, { payload }: PayloadAction<ILocator[]>) {
      const newValue: Partial<ILocator>[] = [];
      payload.forEach(({ elementId, deleted, isGenerated }) => {
        // when we delete locator, we uncheck it, when restore - keep isGenerated state as is
        newValue.push({ elementId, deleted: !deleted, isGenerated: !deleted ? false : isGenerated });
      });
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    toggleElementGeneration(state, { payload }: PayloadAction<string | ILocator>) {
      // ToDo isGenerated refactoring
      const locator = typeof payload === 'string' ? simpleSelectLocatorById(state, payload) : payload;
      if (!locator) return;
      const { isGenerated, elementId } = locator;
      locatorsAdapter.upsertOne(state, { elementId, isGenerated: !isGenerated } as ILocator);
    },
    toggleLocatorIsChecked(state, { payload }: PayloadAction<string>) {
      const locator = simpleSelectLocatorById(state, payload);
      if (!locator) return;

      const { isChecked, elementId } = locator;
      locatorsAdapter.upsertOne(state, { elementId, isChecked: !isChecked } as ILocator);
    },
    toggleAllLocatorsIsChecked(state, { payload }: PayloadAction<{ locators: ILocator[]; isChecked: boolean }>) {
      const { locators, isChecked } = payload;
      locatorsAdapter.upsertMany(state, locators.map(({ elementId }) => ({ elementId, isChecked })) as ILocator[]);
    },
    toggleElementGroupIsChecked(state, { payload }: PayloadAction<ILocator[]>) {
      const newValue: Partial<ILocator>[] = [];
      payload.forEach(({ elementId, isChecked }) => {
        newValue.push({ elementId, isChecked: !isChecked });
      });
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    toggleElementGroupGeneration(state, { payload }: PayloadAction<ILocator[]>) {
      const newValue: Partial<ILocator>[] = [];
      payload.forEach(({ elementId, isGenerated }) => {
        newValue.push({ elementId, isGenerated: !isGenerated });
      });
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    updateLocatorGroup(
      state,
      {
        payload,
      }: PayloadAction<{
        locators: IPartialLocatorDataForUpdate[];
        pageObject: PageObject;
      }>,
    ) {
      const { locators, pageObject } = payload;
      const newValue = locators.map(({ elementId, jdnHash, locatorValue }) => {
        const existingLocator = elementId
          ? simpleSelectLocatorById(state, elementId)
          : simpleSelectLocatorByJdnHash(state, jdnHash, pageObject);
        return (
          existingLocator && {
            elementId: existingLocator.elementId,
            locatorValue: { ...existingLocator.locatorValue, ...locatorValue },
          }
        );
      });
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },

    setExpandedKeys(state, action: PayloadAction<ElementId[]>) {
      state.expandedKeys = action.payload;
    },
    expandCustom(state) {
      state.autoExpandParent = false;
    },
    onExpand(state, action: PayloadAction<ElementId[]>) {
      state.expandedKeys = action.payload;
      state.autoExpandParent = false;
    },
  },
  extraReducers: (builder) => {
    addCustomLocatorReducer(builder),
      changeLocatorElementReducer(builder),
      checkLocatorsValidityReducer(builder),
      identifyElementsReducer(builder),
      createLocatorsReducer(builder),
      rerunGenerationReducer(builder),
      stopGenerationReducer(builder),
      stopGenerationGroupReducer(builder),
      runLocatorsGenerationReducer(builder);
  },
});

export default locatorsSlice.reducer;
export const {
  addLocators,
  changeIdentificationStatus,
  changeLocatorAttributes,
  elementGroupSetActive,
  elementGroupUnsetActive,
  elementSetActive,
  elementUnsetActive,
  failGeneration,
  removeAll,
  removeLocators,
  restoreLocators,
  setActiveSingle,
  setChildrenGeneration,
  setChildrenIsChecked,
  setCalculationPriority,
  setElementGroupGeneration,
  // setJdnHash,
  setScrollToLocator,
  // setValidity,
  toggleDeleted,
  toggleDeletedGroup,
  toggleElementGeneration,
  toggleElementGroupGeneration,
  toggleElementGroupIsChecked,
  toggleLocatorIsChecked,
  toggleAllLocatorsIsChecked,
  updateLocatorGroup,
  setExpandedKeys,
  expandCustom,
  onExpand,
} = locatorsSlice.actions;
