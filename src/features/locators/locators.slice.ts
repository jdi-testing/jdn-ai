import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { size } from "lodash";
import { ElementClass, ElementLibrary } from "./types/generationClasses.types";
import {
  locatorsAdapter,
  simpleSelectLocatorById,
  simpleSelectLocatorByJdnHash,
  simpleSelectLocatorsByPageObject,
} from "./selectors/locators.selectors";
import { createLocatorsReducer } from "./reducers/createLocators.thunk";
import { identifyElementsReducer } from "./reducers/identifyElements.thunk";
import { rerunGenerationReducer } from "./reducers/rerunGeneration.thunk";
import { stopGenerationReducer } from "./reducers/stopGeneration.thunk";
import { stopGenerationGroupReducer } from "./reducers/stopGenerationGroup.thunk";
import {
  LocatorsState,
  LocatorsGenerationStatus,
  IdentificationStatus,
  ElementId,
  LocatorValidationErrorType,
  LocatorTaskStatus,
  Locator,
  LocatorCalculationPriority,
  JDNHash,
  LocatorValue,
} from "./types/locator.types";
import { checkLocatorsValidityReducer } from "./reducers/checkLocatorValidity.thunk";
import { LocatorType } from "../../common/types/common";
import { addCustomLocatorReducer } from "./reducers/addCustomLocator.thunk";
import { changeLocatorElementReducer } from "./reducers/changeLocatorElement.thunk";
import { DEFAULT_ERROR, NETWORK_ERROR } from "./utils/constants";
import { runLocatorsGenerationReducer } from "./reducers/runLocatorsGeneration.thunk";
import { PageObject } from "../pageObjects/types/pageObjectSlice.types";

const initialState: LocatorsState = {
  generationStatus: LocatorsGenerationStatus.noStatus,
  status: IdentificationStatus.noStatus,
  scrollToLocator: null,
};

export interface ChangeLocatorAttributesPayload {
  element_id: ElementId;
  type: ElementClass;
  name: string;
  locator: string;
  message: LocatorValidationErrorType;
  library: ElementLibrary;
  isCustomName?: boolean;
  isGeneratedName?: boolean;
  locatorType: LocatorType;
}

const locatorsSlice = createSlice({
  name: "locators",
  initialState: locatorsAdapter.getInitialState(initialState),
  reducers: {
    addLocators(state, { payload }) {
      locatorsAdapter.addMany(state, payload);
      state.status = IdentificationStatus.success;
    },
    changeLocatorAttributes(state, { payload }: PayloadAction<ChangeLocatorAttributesPayload>) {
      const { locator, element_id, locatorType, ...rest } = payload;

      const _locator = simpleSelectLocatorById(state, element_id);

      if (!_locator) return;

      const newValue = { ..._locator, locator: { ..._locator.locator }, locatorType, ...rest };

      if (locatorType === LocatorType.cssSelector) {
        newValue.locator.cssSelector = locator;
      } else if (locatorType === LocatorType.xPath) {
        newValue.locator.xPath = locator;
      }

      locatorsAdapter.upsertOne(state, newValue);
    },
    changeIdentificationStatus(state, { payload }: PayloadAction<IdentificationStatus>) {
      state.status = payload;
    },
    elementGroupSetActive(
      state,
      { payload }: PayloadAction<Locator[] | { locators: Array<Locator>; fromScript: boolean }>
    ) {
      const locators = Array.isArray(payload) ? payload : payload.locators;
      locatorsAdapter.upsertMany(state, locators.map(({ element_id }) => ({ element_id, active: true })) as Locator[]);
    },
    elementGroupUnsetActive(
      state,
      { payload }: PayloadAction<Array<Locator> | { locators: Array<Locator>; fromScript: boolean }>
    ) {
      const locators = Array.isArray(payload) ? payload : payload.locators;
      const newValue = locators.map(({ element_id }) => ({ element_id, active: false }));
      locatorsAdapter.upsertMany(state, newValue as Locator[]);
    },
    elementSetActive(state, { payload }: PayloadAction<Locator>) {
      locatorsAdapter.upsertOne(state, { element_id: payload.element_id, active: true } as Locator);
    },
    elementUnsetActive(state, { payload }: PayloadAction<ElementId>) {
      locatorsAdapter.upsertOne(state, { element_id: payload, active: false } as Locator);
    },
    failGeneration(state, { payload }: PayloadAction<{ ids: string[]; errorMessage?: string }>) {
      const { ids, errorMessage } = payload;
      if (errorMessage === NETWORK_ERROR) state.generationStatus = LocatorsGenerationStatus.failed;
      const newValues = ids.map((element_id) => {
        const existingLocator = simpleSelectLocatorById(state, element_id);
        if (existingLocator) {
          return {
            element_id,
            locator: {
              ...existingLocator.locator,
              xPathStatus: LocatorTaskStatus.FAILURE,
              errorMessage: errorMessage || DEFAULT_ERROR,
            },
          } as Locator;
        }
        return null;
      });
      locatorsAdapter.upsertMany(state, newValues.filter((value) => value) as Locator[]);
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
    setActiveSingle(state, { payload: locator }: PayloadAction<Locator>) {
      const newValue = simpleSelectLocatorsByPageObject(state, locator.pageObj).map((_loc) =>
        _loc.element_id === locator.element_id ? { ..._loc, active: true } : { ..._loc, active: false }
      );
      locatorsAdapter.upsertMany(state, newValue);
    },
    setCalculationPriority(
      state,
      { payload }: PayloadAction<{ element_id?: ElementId; priority: LocatorCalculationPriority; ids?: ElementId[] }>
    ) {
      const { element_id, ids, priority } = payload;
      if (element_id) locatorsAdapter.upsertOne(state, { element_id, priority } as Locator);
      if (ids) {
        const newValue: Partial<Locator>[] = ids.map((element_id) => ({ element_id, priority }));
        locatorsAdapter.upsertMany(state, newValue as Locator[]);
      }
    },
    setChildrenGeneration(state, { payload }: PayloadAction<{ locator: Locator; generate: boolean }>) {
      const { locator, generate } = payload;
      const newValue: Partial<Locator>[] = [];
      const toggleGenerate = (_locator: Locator) => {
        _locator.children &&
          _locator.children.forEach((childId) => {
            newValue.push({ element_id: childId, generate });
            const child = simpleSelectLocatorById(state, childId);
            if (child && size(child.children)) toggleGenerate(child);
          });
      };
      toggleGenerate(locator);
      locatorsAdapter.upsertMany(state, newValue as Locator[]);
    },
    setElementGroupGeneration(state, { payload }: PayloadAction<{ locators: Locator[]; generate: boolean }>) {
      const { locators, generate } = payload;
      locatorsAdapter.upsertMany(state, locators.map(({ element_id }) => ({ element_id, generate })) as Locator[]);
    },
    setJdnHash(state, { payload }: PayloadAction<{ element_id: ElementId; jdnHash: string }>) {
      const { element_id, jdnHash } = payload;
      locatorsAdapter.upsertOne(state, { element_id, jdnHash } as Locator);
    },
    setScrollToLocator(state, { payload: element_id }: PayloadAction<ElementId>) {
      state.scrollToLocator = element_id;
    },
    setValidity(state, { payload }: PayloadAction<{ element_id: ElementId; message: Locator["message"] }>) {
      locatorsAdapter.upsertOne(state, payload as Locator);
    },
    toggleDeleted(state, { payload }: PayloadAction<string>) {
      const locator = simpleSelectLocatorById(state, payload);
      locator &&
        locatorsAdapter.upsertOne(state, {
          ...locator,
          deleted: !locator.deleted,
          // when we delete locator, we uncheck it, when restore - keep generate state as is
          generate: !locator.deleted ? false : locator.generate,
        } as Locator);
    },
    toggleDeletedGroup(state, { payload }: PayloadAction<Locator[]>) {
      const newValue: Partial<Locator>[] = [];
      payload.forEach(({ element_id, deleted, generate }) => {
        // when we delete locator, we uncheck it, when restore - keep generate state as is
        newValue.push({ element_id, deleted: !deleted, generate: !deleted ? false : generate });
      });
      locatorsAdapter.upsertMany(state, newValue as Locator[]);
    },
    toggleElementGeneration(state, { payload }: PayloadAction<string | Locator>) {
      const locator = typeof payload === "string" ? simpleSelectLocatorById(state, payload) : payload;
      if (!locator) return;
      const { generate, element_id } = locator;
      locatorsAdapter.upsertOne(state, { element_id, generate: !generate } as Locator);
    },
    toggleElementGroupGeneration(state, { payload }: PayloadAction<Locator[]>) {
      const newValue: Partial<Locator>[] = [];
      payload.forEach(({ element_id, generate }) => {
        newValue.push({ element_id, generate: !generate });
      });
      locatorsAdapter.upsertMany(state, newValue as Locator[]);
    },
    updateLocatorGroup(
      state,
      {
        payload,
      }: PayloadAction<{
        locators: { element_id?: ElementId; jdnHash?: JDNHash; locator: Partial<LocatorValue> }[];
        pageObject: PageObject;
      }>
    ) {
      const { locators, pageObject } = payload;
      const newValue = locators.map(({ element_id, jdnHash, locator }) => {
        const existingLocator = element_id
          ? simpleSelectLocatorById(state, element_id)
          : simpleSelectLocatorByJdnHash(state, jdnHash!, pageObject);
        return (
          existingLocator && {
            element_id: existingLocator.element_id,
            locator: { ...existingLocator.locator, ...locator },
          }
        );
      });
      locatorsAdapter.upsertMany(state, newValue as Locator[]);
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
  setCalculationPriority,
  setElementGroupGeneration,
  setJdnHash,
  setScrollToLocator,
  setValidity,
  toggleDeleted,
  toggleDeletedGroup,
  toggleElementGeneration,
  toggleElementGroupGeneration,
  updateLocatorGroup,
} = locatorsSlice.actions;
