import { ActionReducerMapBuilder, createAsyncThunk, EntityState, PayloadAction } from "@reduxjs/toolkit";
import { filterAdapter, simpleSelectFilterById } from "../filter.selectors";
import { RootState } from "../../../app/store/store";
import { FilterKey, ClassFilterValue } from "../types/filter.types";
import { jdiClassFilterInit } from "../utils/filterSet";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementClass, ElementLibrary } from "../../locators/types/generationClasses.types";

export const toggleClassFilterAll = createAsyncThunk(
  "filter/toggleClassFilterAll",
  async (payload: { pageObjectId: PageObjectId; library: ElementLibrary; value: boolean }, { getState }) => {
    const { pageObjectId, value, library } = payload;
    const state = getState() as RootState;
    let newValue = simpleSelectFilterById(state.filters, pageObjectId);
    if (!newValue) {
      newValue = { pageObjectId, [FilterKey.JDIclassFilter]: jdiClassFilterInit(library) };
    }
    const filter = { ...newValue[FilterKey.JDIclassFilter] };
    // don't know how to fix it
    //@ts-ignore
    Object.keys(filter).forEach((key: string) => {filter[key] = value});
    return { newValue, filter, library };
  }
);

//fix types
export const toggleClassFilterAllReducer = (builder: any) => {
  return (
    builder
      .addCase(toggleClassFilterAll.fulfilled, (state: any, { payload }: any) => {
        const { newValue, filter, library } = payload;

        filterAdapter.upsertOne(state, { ...newValue, [FilterKey.JDIclassFilter]: filter });

        if (!localStorage.getItem("filters")) {
          localStorage.setItem("filters", JSON.stringify({ [library]: filter }));
        } else {
          const savedFilters = JSON.parse(localStorage.getItem("filters")!);
          localStorage.setItem("filters", JSON.stringify({ ...savedFilters, [library]: filter }));
        }
      })
      // @ts-ignore
      .addCase(toggleClassFilterAll.rejected, (state, { error }) => {
        throw new Error(error.stack);
      })
  );
};
