import { createSlice } from "@reduxjs/toolkit";
import { lowerFirst } from "lodash";
import { identificationStatus, locatorTaskStatus, VALIDATION_ERROR_TYPE } from "../../utils/constants";
import { getJdiClassName, getJDILabel } from "../../utils/generationClassesMap";
import { locatorsAdapter, simpleSelectLocatorById } from "../selectors/locatorSelectors";
import { cancelStopGenerationReducer } from "../thunks/cancelStopGeneration";
import { generateLocatorsReducer } from "../thunks/generateLocators";
import { identifyElementsReducer } from "../thunks/identifyElements";
import { stopGenerationReducer } from "../thunks/stopGeneration";
import { stopGenerationGroupReducer } from "../thunks/stopGenerationGroup";

const initialState = {
  status: identificationStatus.noStatus,
  predictedElements: [],
};

const locatorsSlice = createSlice({
  name: "locators",
  initialState: locatorsAdapter.getInitialState(initialState),
  reducers: {
    addLocators(state, { payload }) {
      locatorsAdapter.addMany(state, payload);
    },
    changeLocatorAttributes(state, { payload }) {
      const { type, name, locator, element_id, validity, newElement } = payload;
      const _locator = simpleSelectLocatorById(state, element_id);
      const { fullXpath, robulaXpath } = _locator.locator;
      let newValue = { ..._locator, locator: { ..._locator.locator }, validity };
      if (_locator.name !== name) {
        newValue.name = name;
        newValue.isCustomName = true;
      }
      if (_locator.type !== type) {
        if (!newValue.isCustomName) {
          newValue.name = lowerFirst(getJdiClassName(type));
        }
        newValue.type = getJDILabel(type);
      }
      if (fullXpath !== locator && robulaXpath !== locator) {
        newValue.locator.customXpath = locator;
        newValue.isCustomLocator = true;
        if (newValue.locator.taskStatus === locatorTaskStatus.REVOKED) {
          newValue.locator.taskStatus = locatorTaskStatus.SUCCESS;
        }
      }
      if (validity && validity.locator === VALIDATION_ERROR_TYPE.NEW_ELEMENT) {
        locatorsAdapter.removeOne(state, element_id);
        newValue = { ...newValue, ...newElement };
        newValue.predicted_probability = 1;
      }
      locatorsAdapter.upsertOne(state, newValue);
    },
    removeAll(state) {
      locatorsAdapter.removeAll(state);
    },
    removeLocators(state, { payload: ids }) {
      locatorsAdapter.removeMany(state, ids);
    },
    toggleElementGeneration(state, { payload }) {
      const locator = typeof payload === "string" ? simpleSelectLocatorById(state, payload) : payload;
      locatorsAdapter.upsertOne(state, { ...locator, generate: !locator.generate });
    },
    toggleElementGroupGeneration(state, { payload }) {
      const newValue = [];
      payload.forEach(({element_id, generate}) => {
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
      payload.forEach(({element_id, deleted, generate }) => {
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
  toggleElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
  updateLocator,
  restoreLocators,
  addCmElementHighlight,
  clearCmElementHighlight,
} = locatorsSlice.actions;
