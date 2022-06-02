import { createSlice } from "@reduxjs/toolkit";
import { isUndefined, lowerFirst, size } from "lodash";
import { identificationStatus, locatorTaskStatus } from "../../utils/constants";
import { getJdiClassName, getJDILabel } from "../../utils/generationClassesMap";
import { locatorsAdapter, simpleSelectLocatorById } from "../selectors/locatorSelectors";
import { cancelStopGenerationReducer } from "../thunks/cancelStopGeneration";
import { generateLocatorsReducer } from "../thunks/generateLocators";
import { identifyElementsReducer } from "../thunks/identifyElements";
import { stopGenerationReducer } from "../thunks/stopGeneration";
import { stopGenerationGroupReducer } from "../thunks/stopGenerationGroup";

const initialState = {
  status: identificationStatus.noStatus,
  scrollToLocator: null,
};

const locatorsSlice = createSlice({
  name: "locators",
  initialState: locatorsAdapter.getInitialState(initialState),
  reducers: {
    addLocators(state, { payload }) {
      locatorsAdapter.addMany(state, payload.map((locator) => ({ ...locator })));
    },
    changeLocatorAttributes(state, { payload }) {
      const { type, name, locator, element_id, validity, isCustomName, library } = payload;
      const _locator = simpleSelectLocatorById(state, element_id);
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
        if (newValue.locator.taskStatus === locatorTaskStatus.REVOKED) {
          newValue.locator.taskStatus = locatorTaskStatus.SUCCESS;
        }
      } else {
        delete newValue.locator.customXpath;
        newValue.isCustomLocator = false;
      }
      locatorsAdapter.upsertOne(state, newValue);
    },
    removeAll(state) {
      locatorsAdapter.removeAll(state);
    },
    removeLocators(state, { payload: ids }) {
      if (ids) locatorsAdapter.removeMany(state, ids);
    },
    toggleElementGeneration(state, { payload }) {
      const locator = typeof payload === "string" ? simpleSelectLocatorById(state, payload) : payload;
      const { generate, element_id } = locator;
      locatorsAdapter.upsertOne(state, { element_id, generate: !generate });
    },
    setChildrenGeneration(state, { payload }) {
      const { locator, generate } = payload;
      const newValue = [];
      const toggleGenerate = (_locator) => {
        _locator.children.forEach((childId) => {
          newValue.push({ element_id: childId, generate });
          const child = simpleSelectLocatorById(state, childId);
          if (size(child.children)) toggleGenerate(child);
        });
      };
      toggleGenerate(locator);
      locatorsAdapter.upsertMany(state, newValue);
    },
    setScrollToLocator(state, {payload: element_id}) {
      state.scrollToLocator = element_id;
    },
    toggleElementGroupGeneration(state, { payload }) {
      const newValue = [];
      payload.forEach(({ element_id, generate }) => {
        newValue.push({ element_id, generate: !generate });
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    toggleDeleted(state, { payload }) {
      const locator = simpleSelectLocatorById(state, payload);
      locatorsAdapter.upsertOne(state, {
        ...locator,
        deleted: !locator.deleted,
        // when we delete locator, we uncheck it, when restore - keep generate state as is
        generate: !locator.deleted ? false : locator.generate,
      });
    },
    toggleDeletedGroup(state, { payload }) {
      const newValue = [];
      payload.forEach(({ element_id, deleted, generate }) => {
        // when we delete locator, we uncheck it, when restore - keep generate state as is
        newValue.push({ element_id, deleted: !deleted, generate: !deleted ? false : generate });
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    updateLocator(state, { payload }) {
      const { element_id, locator } = payload;
      const existingLocator = simpleSelectLocatorById(state, element_id);
      if (existingLocator) {
        locatorsAdapter.upsertOne(state, { element_id, locator: { ...existingLocator.locator, ...locator } });
      }
    },
    restoreLocators(state, { payload: locators }) {
      locatorsAdapter.setMany(state, locators);
    },
    addCmElementHighlight(state, { payload }) {
      locatorsAdapter.upsertOne(state, { element_id: payload, isCmHighlighted: true });
    },
    clearCmElementHighlight(state, { payload }) {
      locatorsAdapter.upsertOne(state, { element_id: payload, isCmHighlighted: false });
    },
  },
  extraReducers: (builder) => {
    identifyElementsReducer(builder),
    generateLocatorsReducer(builder),
    stopGenerationReducer(builder),
    stopGenerationGroupReducer(builder),
    cancelStopGenerationReducer(builder);
  },
});

export default locatorsSlice.reducer;
export const {
  addLocators,
  changeLocatorAttributes,
  removeLocators,
  removeAll,
  toggleElementGeneration,
  setChildrenGeneration,
  setScrollToLocator,
  toggleElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
  updateLocator,
  restoreLocators,
  addCmElementHighlight,
  clearCmElementHighlight,
} = locatorsSlice.actions;
