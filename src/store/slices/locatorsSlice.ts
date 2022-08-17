import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { isUndefined, lowerFirst, size } from "lodash";
import { getJdiClassName, getJDILabel } from "../../utils/generationClassesMap";
import { locatorsAdapter, simpleSelectLocatorById } from "../selectors/locatorSelectors";
import { cancelStopGenerationReducer } from "../thunks/cancelStopGeneration";
import { generateLocatorsReducer } from "../thunks/generateLocators";
import { identifyElementsReducer } from "../thunks/identifyElements";
import { rerunGenerationReducer } from "../thunks/rerunGeneration";
import { stopGenerationReducer } from "../thunks/stopGeneration";
import { stopGenerationGroupReducer } from "../thunks/stopGenerationGroup";
import { ElementId, IdentificationStatus, Locator, LocatorCalculationPriority, LocatorsState, LocatorsGenerationStatus, LocatorTaskStatus } from "./locatorSlice.types";

const initialState: LocatorsState = {
  generationStatus: LocatorsGenerationStatus.noStatus,
  status: IdentificationStatus.noStatus,
  scrollToLocator: null,
};

const locatorsSlice = createSlice({
  name: "locators",
  initialState: locatorsAdapter.getInitialState(initialState),
  reducers: {
    addLocators(state, { payload }) {
      locatorsAdapter.addMany(state, payload);
    },
    changeLocatorAttributes(state, { payload }) {
      const { type, name, locator, element_id, validity, isCustomName, library } = payload;
      const _locator = simpleSelectLocatorById(state, element_id);
      if (!_locator) return;
      const { fullXpath, robulaXpath } = _locator.locator;
      const newValue = { ..._locator, locator: { ..._locator.locator }, validity };
      if (_locator.name !== name) {
        newValue.name = name;
        newValue.isCustomName = isUndefined(isCustomName) ? true : isCustomName;
      }
      if (_locator.type !== type) {
        if (!newValue.isCustomName) {
          newValue.name = lowerFirst(getJdiClassName(type, library));
        }
        newValue.type = getJDILabel(type, library);
      }
      if (fullXpath !== locator && robulaXpath !== locator) {
        newValue.locator.customXpath = locator;
        newValue.isCustomLocator = true;
        newValue.locator.taskStatus = LocatorTaskStatus.SUCCESS;
      } else {
        delete newValue.locator.customXpath;
        newValue.isCustomLocator = false;
      }
      locatorsAdapter.upsertOne(state, newValue);
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
    setChildrenGeneration(state, { payload }: PayloadAction<{locator: Locator, generate: boolean}>) {
      const { locator, generate } = payload;
      const newValue: Partial<Locator>[] = [];
      const toggleGenerate = (_locator: Locator) => {
        _locator.children && _locator.children.forEach((childId) => {
          newValue.push({ element_id: childId, generate });
          const child = simpleSelectLocatorById(state, childId);
          if (child && size(child.children)) toggleGenerate(child);
        });
      };
      toggleGenerate(locator);
      locatorsAdapter.upsertMany(state, newValue as Locator[]);
    },
    setCalculationPriority(state, { payload }: PayloadAction<{ element_id: ElementId, ids: ElementId[], priority: LocatorCalculationPriority }>) {
      const { element_id, ids, priority } = payload;
      if (element_id) locatorsAdapter.upsertOne(state, { element_id, priority } as Locator);
      if (ids) {
        const newValue: Partial<Locator>[] = ids.map((element_id) => ({ element_id, priority }));
        locatorsAdapter.upsertMany(state, newValue as Locator[]);
      }
    },
    setGenerationStatus(state, { payload }) {
      state.generationStatus = payload;
    },
    setScrollToLocator(state, { payload: element_id }) {
      state.scrollToLocator = element_id;
    },
    setElementGroupGeneration(state, { payload }: PayloadAction<{ids: string[], generate: boolean}>) {
      const { ids, generate } = payload;
      // const newValue: Partial<Locator> = ;
      locatorsAdapter.upsertMany(
        state,
        ids.map((id) => ({ element_id: id, generate })) as Locator[],
      );
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
      existingLocator && locatorsAdapter.upsertOne(state, { element_id, locator: { ...existingLocator.locator, ...locator } } as Locator);
    },
    restoreLocators(state, { payload: locators }) {
      locatorsAdapter.setMany(state, locators);
    },
    addCmElementHighlight(state, { payload }) {
      locatorsAdapter.upsertOne(state, { element_id: payload, isCmHighlighted: true } as Locator);
    },
    clearCmElementHighlight(state, { payload }) {
      locatorsAdapter.upsertOne(state, { element_id: payload, isCmHighlighted: false } as Locator);
    },
  },
  extraReducers: (builder) => {
    identifyElementsReducer(builder),
    generateLocatorsReducer(builder),
    rerunGenerationReducer(builder),
    stopGenerationReducer(builder),
    stopGenerationGroupReducer(builder),
    cancelStopGenerationReducer(builder);
  },
});

export default locatorsSlice.reducer;
export const {
  addLocators,
  changeLocatorAttributes,
  failGeneration,
  removeLocators,
  removeAll,
  toggleElementGeneration,
  setChildrenGeneration,
  setCalculationPriority,
  setScrollToLocator,
  setElementGroupGeneration,
  toggleElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
  updateLocator,
  restoreLocators,
  addCmElementHighlight,
  clearCmElementHighlight,
} = locatorsSlice.actions;
