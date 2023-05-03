import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { size } from "lodash";
import { ElementClass, ElementLibrary } from "./types/generationClasses.types";
import { locatorsAdapter, simpleSelectLocatorById, simpleSelectLocatorsByPageObject } from "./locators.selectors";
import { generateLocatorsReducer } from "./reducers/generateLocators.thunk";
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
} from "./types/locator.types";
import { runXpathGenerationReducer } from "./reducers/runXpathGeneration.thunk";
import { checkLocatorsValidityReducer } from "./reducers/checkLocatorValidity.thunk";
import { LocatorType } from "../../common/types/common";
import { addCustomLocatorReducer } from "./reducers/addCustomLocator.thunk";
import { changeLocatorElementReducer } from "./reducers/changeLocatorElement.thunk";

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
    },
    changeLocatorAttributes(state, { payload }: PayloadAction<ChangeLocatorAttributesPayload>) {
      const { locator, element_id, locatorType, ...rest } = payload;

      const _locator = simpleSelectLocatorById(state, element_id);

      if (!_locator) return;

      const newValue = { ..._locator, locator: { ..._locator.locator, output: locator }, locatorType, ...rest };

      if (_locator.locator.cssSelector !== locator && locatorType === LocatorType.cssSelector) {
        newValue.locator.cssSelector = locator;
      } else if (locatorType === LocatorType.xPath && _locator.locator.xPath !== locator) {
        newValue.locator.xPath = locator;
      }

      // newValue.locator.taskStatus = LocatorTaskStatus.SUCCESS; // do we need it?

      locatorsAdapter.upsertOne(state, newValue);
    },
    changeIdentificationStatus(state, { payload }: PayloadAction<IdentificationStatus>) {
      state.status = payload;
    },
    failGeneration(state, { payload }: PayloadAction<string[]>) {
      state.generationStatus = LocatorsGenerationStatus.failed;
      payload.forEach((element_id) => {
        const existingLocator = simpleSelectLocatorById(state, element_id);
        if (existingLocator) {
          locatorsAdapter.upsertOne(state, {
            element_id,
            locator: {
              ...existingLocator.locator,
              taskStatus: LocatorTaskStatus.FAILURE,
              errorMessage: "Network Error has been encountered.",
            },
          } as Locator);
        }
      });
    },
    removeAll(state) {
      locatorsAdapter.removeAll(state);
    },
    removeLocators(state, { payload: ids }) {
      if (ids) locatorsAdapter.removeMany(state, ids);
    },
    toggleElementGeneration(state, { payload }: PayloadAction<string | Locator>) {
      const locator = typeof payload === "string" ? simpleSelectLocatorById(state, payload) : payload;
      if (!locator) return;
      const { generate, element_id } = locator;
      locatorsAdapter.upsertOne(state, { element_id, generate: !generate } as Locator);
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
    setCalculationPriority(
      state,
      { payload }: PayloadAction<{ element_id: ElementId; priority: LocatorCalculationPriority; ids?: ElementId[] }>
    ) {
      const { element_id, ids, priority } = payload;
      if (element_id) locatorsAdapter.upsertOne(state, { element_id, priority } as Locator);
      if (ids) {
        const newValue: Partial<Locator>[] = ids.map((element_id) => ({ element_id, priority }));
        locatorsAdapter.upsertMany(state, newValue as Locator[]);
      }
    },
    setJdnHash(state, { payload }: PayloadAction<{ element_id: ElementId; jdnHash: string }>) {
      const { element_id, jdnHash } = payload;
      locatorsAdapter.upsertOne(state, { element_id, jdnHash } as Locator);
    },
    setScrollToLocator(state, { payload: element_id }: PayloadAction<ElementId>) {
      state.scrollToLocator = element_id;
    },
    setElementGroupGeneration(state, { payload }: PayloadAction<{ locators: Locator[]; generate: boolean }>) {
      const { locators, generate } = payload;
      locatorsAdapter.upsertMany(state, locators.map(({ element_id }) => ({ element_id, generate })) as Locator[]);
    },
    setValidity(state, { payload }: PayloadAction<{ element_id: ElementId; message: Locator["message"] }>) {
      locatorsAdapter.upsertOne(state, payload as Locator);
    },
    toggleElementGroupGeneration(state, { payload }: PayloadAction<Locator[]>) {
      const newValue: Partial<Locator>[] = [];
      payload.forEach(({ element_id, generate }) => {
        newValue.push({ element_id, generate: !generate });
      });
      locatorsAdapter.upsertMany(state, newValue as Locator[]);
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
    updateLocator(state, { payload }) {
      const { element_id, locator } = payload;
      const existingLocator = simpleSelectLocatorById(state, element_id);
      existingLocator &&
        locatorsAdapter.upsertOne(state, {
          element_id,
          locator: { ...existingLocator.locator, ...locator },
        } as Locator);
    },
    restoreLocators(state, { payload: locators }) {
      locatorsAdapter.setMany(state, locators);
    },
    elementSetActive(state, { payload }: PayloadAction<ElementId>) {
      locatorsAdapter.upsertOne(state, { element_id: payload, active: true } as Locator);
    },
    elementGroupSetActive(
      state,
      { payload }: PayloadAction<Locator[] | { locators: Array<Locator>; fromScript: boolean }>
    ) {
      const locators = Array.isArray(payload) ? payload : payload.locators;
      locatorsAdapter.upsertMany(state, locators.map((_locator) => ({ ..._locator, active: true })) as Locator[]);
    },
    setActiveSingle(state, { payload: locator }: PayloadAction<Locator>) {
      const newValue = simpleSelectLocatorsByPageObject(state, locator.pageObj).map((_loc) =>
        _loc.element_id === locator.element_id ? { ..._loc, active: true } : { ..._loc, active: false }
      );
      locatorsAdapter.upsertMany(state, newValue);
    },
    elementUnsetActive(state, { payload }: PayloadAction<ElementId>) {
      locatorsAdapter.upsertOne(state, { element_id: payload, active: false } as Locator);
    },
    elementGroupUnsetActive(
      state,
      { payload }: PayloadAction<Array<Locator> | { locators: Array<Locator>; fromScript: boolean }>
    ) {
      const locators = Array.isArray(payload) ? payload : payload.locators;
      const newValue = locators.map((_locator) => ({ ..._locator, active: false }));
      locatorsAdapter.upsertMany(state, newValue);
    },
  },
  extraReducers: (builder) => {
    addCustomLocatorReducer(builder),
      changeLocatorElementReducer(builder),
      checkLocatorsValidityReducer(builder),
      identifyElementsReducer(builder),
      generateLocatorsReducer(builder),
      rerunGenerationReducer(builder),
      stopGenerationReducer(builder),
      stopGenerationGroupReducer(builder),
      runXpathGenerationReducer(builder);
  },
});

export default locatorsSlice.reducer;
export const {
  addLocators,
  changeIdentificationStatus,
  changeLocatorAttributes,
  failGeneration,
  removeLocators,
  removeAll,
  toggleElementGeneration,
  setChildrenGeneration,
  setCalculationPriority,
  setScrollToLocator,
  setElementGroupGeneration,
  setJdnHash,
  setValidity,
  toggleElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
  updateLocator,
  restoreLocators,
  elementSetActive,
  setActiveSingle,
  elementUnsetActive,
  elementGroupSetActive,
  elementGroupUnsetActive,
} = locatorsSlice.actions;
