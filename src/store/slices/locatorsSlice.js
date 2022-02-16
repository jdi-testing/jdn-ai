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
      if (validity && (validity.locator === VALIDATION_ERROR_TYPE.NEW_ELEMENT)) {
        locatorsAdapter.removeOne(state, element_id);
        newValue = {...newValue, ...newElement};
        newValue.predicted_probability = 1;
      }
      locatorsAdapter.upsertOne(state, newValue);
    },
    changeLocatorSettings(state, { payload }) {
      locatorsAdapter.upsertMany(state, payload);
    },
    toggleElementGeneration(state, { payload }) {
      const locator = simpleSelectLocatorById(state, payload);
      locatorsAdapter.upsertOne(state, { ...locator, generate: !locator.generate });
    },
    toggleElementGroupGeneration(state, { payload }) {
      const newValue = [];
      payload.forEach((locator) => {
        newValue.push({ ...locator, generate: !locator.generate });
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    toggleDeleted(state, { payload }) {
      const locator = simpleSelectLocatorById(state, payload);
      locatorsAdapter.upsertOne(state, { ...locator, deleted: !locator.deleted });
    },
    toggleDeletedGroup(state, { payload }) {
      const newValue = [];
      payload.forEach((locator) => {
        newValue.push({ ...locator, deleted: !locator.deleted });
      });
      locatorsAdapter.upsertMany(state, newValue);
    },
    updateLocator(state, { payload }) {
      const { element_id, locator } = payload;
      const existingLocator = simpleSelectLocatorById(state, element_id);
      locatorsAdapter.upsertOne(state, { element_id, locator: { ...existingLocator.locator, ...locator } });
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
  changeLocatorSettings,
  toggleElementGeneration,
  toggleElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
  updateLocator,
  addCmElementHighlight,
  clearCmElementHighlight,
} = locatorsSlice.actions;
