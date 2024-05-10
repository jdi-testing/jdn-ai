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
  JDNHash,
  LocatorCalculationPriority,
  LocatorsGenerationStatus,
  LocatorsState,
  LocatorTaskStatus,
  LocatorValidationErrorType,
  LocatorValidationWarnings,
  LocatorValue,
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
};

export interface ChangeLocatorAttributesPayload {
  element_id: ElementId;
  type: ElementClass;
  name: string;
  locatorValue: string;
  message: LocatorValidationErrorType;
  library: ElementLibrary;
  isCustomName?: boolean;
  isGeneratedName?: boolean;
  locatorType: LocatorType;
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
      // ToDo: fix legacy naming
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { locatorValue, element_id, locatorType, ...rest } = payload;

      const currentLocator = simpleSelectLocatorById(state, element_id);

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
      locatorsAdapter.upsertMany(state, locators.map(({ element_id }) => ({ element_id, active: true })) as ILocator[]);
    },
    elementGroupUnsetActive(
      state,
      { payload }: PayloadAction<ILocator[] | { locators: ILocator[]; fromScript: boolean }>,
    ) {
      const locators = Array.isArray(payload) ? payload : payload.locators;
      const newValue = locators.map(({ element_id }) => ({ element_id, active: false }));
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    elementSetActive(state, { payload }: PayloadAction<ILocator>) {
      locatorsAdapter.upsertOne(state, { element_id: payload.element_id, active: true } as ILocator);
    },
    elementUnsetActive(state, { payload }: PayloadAction<ElementId>) {
      locatorsAdapter.upsertOne(state, { element_id: payload, active: false } as ILocator);
    },
    failGeneration(state, { payload }: PayloadAction<{ ids: string[]; errorMessage?: string }>) {
      const { ids, errorMessage } = payload;
      console.error('NETWORK ERROR: ', errorMessage);
      if (errorMessage === NETWORK_ERROR) state.generationStatus = LocatorsGenerationStatus.failed;
      const newValues = ids.map((element_id) => {
        const existingLocator = simpleSelectLocatorById(state, element_id);
        if (existingLocator) {
          return {
            element_id,
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
        _loc.element_id === locator.element_id ? { ..._loc, active: true } : { ..._loc, active: false },
      );
      locatorsAdapter.upsertMany(state, newValue);
    },
    setCalculationPriority(
      state,
      { payload }: PayloadAction<{ element_id?: ElementId; priority: LocatorCalculationPriority; ids?: ElementId[] }>,
    ) {
      // ToDo: fix legacy naming
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { element_id, ids, priority } = payload;
      if (element_id) locatorsAdapter.upsertOne(state, { element_id, priority } as ILocator);
      if (ids) {
        // ToDo: fix legacy naming
        // eslint-disable-next-line @typescript-eslint/naming-convention, @typescript-eslint/no-shadow
        const newValue: Partial<ILocator>[] = ids.map((element_id) => ({ element_id, priority }));
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
            newValue.push({ element_id: childId, isGenerated });
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
            newValue.push({ element_id: childId, isChecked });
            const child = simpleSelectLocatorById(state, childId);
            if (child && size(child.children)) toggleIsChecked(child);
          });
      };
      toggleIsChecked(locator);
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    setElementGroupGeneration(state, { payload }: PayloadAction<{ locators: ILocator[]; isGenerated: boolean }>) {
      const { locators, isGenerated } = payload;
      locatorsAdapter.upsertMany(state, locators.map(({ element_id }) => ({ element_id, isGenerated })) as ILocator[]);
    },
    setJdnHash(state, { payload }: PayloadAction<{ element_id: ElementId; jdnHash: string }>) {
      // ToDo: fix legacy naming
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { element_id, jdnHash } = payload;
      locatorsAdapter.upsertOne(state, { element_id, jdnHash } as ILocator);
    },
    setScrollToLocator(state, { payload: element_id }: PayloadAction<ElementId>) {
      state.scrollToLocator = element_id;
    },
    setValidity(state, { payload }: PayloadAction<{ element_id: ElementId; message: ILocator['message'] }>) {
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
      payload.forEach(({ element_id, deleted, isGenerated }) => {
        // when we delete locator, we uncheck it, when restore - keep isGenerated state as is
        newValue.push({ element_id, deleted: !deleted, isGenerated: !deleted ? false : isGenerated });
      });
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    toggleElementGeneration(state, { payload }: PayloadAction<string | ILocator>) {
      // ToDo isGenerated refactoring
      const locator = typeof payload === 'string' ? simpleSelectLocatorById(state, payload) : payload;
      if (!locator) return;
      // ToDo: fix legacy naming
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { isGenerated, element_id } = locator;
      locatorsAdapter.upsertOne(state, { element_id, isGenerated: !isGenerated } as ILocator);
    },
    toggleLocatorIsChecked(state, { payload }: PayloadAction<string>) {
      const locator = simpleSelectLocatorById(state, payload);
      if (!locator) return;
      // ToDo: fix legacy naming
      // eslint-disable-next-line @typescript-eslint/naming-convention
      const { isChecked, element_id } = locator;
      locatorsAdapter.upsertOne(state, { element_id, isChecked: !isChecked } as ILocator);
    },
    toggleAllLocatorsIsChecked(state, { payload }: PayloadAction<{ locators: ILocator[]; isChecked: boolean }>) {
      const { locators, isChecked } = payload;
      locatorsAdapter.upsertMany(state, locators.map(({ element_id }) => ({ element_id, isChecked })) as ILocator[]);
    },
    toggleElementGroupIsChecked(state, { payload }: PayloadAction<ILocator[]>) {
      const newValue: Partial<ILocator>[] = [];
      payload.forEach(({ element_id, isChecked }) => {
        newValue.push({ element_id, isChecked: !isChecked });
      });
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    toggleElementGroupGeneration(state, { payload }: PayloadAction<ILocator[]>) {
      const newValue: Partial<ILocator>[] = [];
      payload.forEach(({ element_id, isGenerated }) => {
        newValue.push({ element_id, isGenerated: !isGenerated });
      });
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
    },
    updateLocatorGroup(
      state,
      {
        payload,
      }: PayloadAction<{
        locators: { element_id?: ElementId; jdnHash: JDNHash; locatorValue: Partial<LocatorValue> }[];
        pageObject: PageObject;
      }>,
    ) {
      const { locators, pageObject } = payload;
      const newValue = locators.map(({ element_id, jdnHash, locatorValue }) => {
        const existingLocator = element_id
          ? simpleSelectLocatorById(state, element_id)
          : simpleSelectLocatorByJdnHash(state, jdnHash, pageObject);
        return (
          existingLocator && {
            element_id: existingLocator.element_id,
            locatorValue: { ...existingLocator.locatorValue, ...locatorValue },
          }
        );
      });
      locatorsAdapter.upsertMany(state, newValue as ILocator[]);
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
} = locatorsSlice.actions;
