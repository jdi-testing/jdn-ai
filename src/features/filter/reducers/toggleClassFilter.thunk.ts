import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { filterAdapter, simpleSelectFilterById } from "../filter.selectors";
import { RootState } from "../../../app/store/store";
import { FilterKey, Filter } from "../types/filter.types";
import { jdiClassFilterInit } from "../utils/filterSet";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementClass, ElementLibrary } from "../../locators/types/generationClasses.types";

interface toggleClassFilterPayload {
  pageObjectId: PageObjectId;
  library: ElementLibrary;
  jdiClass: ElementClass;
  value: boolean;
}

interface toggleClassFilterReducerPayload extends toggleClassFilterPayload {
  newValue: Filter;
}

export const toggleClassFilter = createAsyncThunk(
  "filter/toggleClassFilter",
  async (payload: toggleClassFilterPayload, { getState }) => {
    const { pageObjectId } = payload;
    const state = getState() as RootState;
    const newValue = simpleSelectFilterById(state.filters, pageObjectId);
    return { newValue, ...payload };
  }
);

export const toggleClassFilterReducer = (builder: any) => {
  return builder
    .addCase(toggleClassFilter.fulfilled, (state: RootState, { payload }: { payload: toggleClassFilterReducerPayload }) => {
      const { newValue, pageObjectId, library, jdiClass, value } = payload;
      const savedFilters = JSON.parse(localStorage.getItem("filters")!);

      if (newValue) {
        const newFilter = { ...newValue[FilterKey.JDIclassFilter], [jdiClass]: value };
        filterAdapter.upsertOne(state.filters, { ...newValue, [jdiClass]: value });
        localStorage.setItem("filters", JSON.stringify({ ...savedFilters, [library]: newFilter }));
      } else {
        const initialFilter = {
          ...jdiClassFilterInit(library),
          ...(savedFilters && savedFilters[library] && savedFilters[library]),
        };
        initialFilter[jdiClass] = value;
        filterAdapter.addOne(state.filters, {
          pageObjectId,
          [FilterKey.JDIclassFilter]: { ...initialFilter },
        });

        if (!localStorage.getItem("filters")) {
          localStorage.setItem("filters", JSON.stringify({ [library]: { ...initialFilter } }));
        } else {
          localStorage.setItem("filters", JSON.stringify({ ...savedFilters, [library]: initialFilter }));
        }
      }
    })
    .addCase(toggleClassFilter.rejected, (state: RootState, { error }: { error: Error}) => {
      throw new Error(error.stack);
    });
};
