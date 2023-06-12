import { createAsyncThunk } from "@reduxjs/toolkit";
import { filterAdapter, simpleSelectFilterById } from "../filter.selectors";
import { RootState } from "../../../app/store/store";
import { FilterKey, ClassFilterValue, Filter } from "../types/filter.types";
import { jdiClassFilterInit } from "../utils/filterSet";
import { PageObjectId } from "../../pageObjects/types/pageObjectSlice.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { LocalStorageKey, setLocalStorage, getLocalStorage } from "../../../common/utils/localStorage";

export const toggleClassFilterAll = createAsyncThunk(
  "filter/toggleClassFilterAll",
  async (payload: { pageObjectId: PageObjectId; library: ElementLibrary; value: boolean }, { getState }) => {
    const { pageObjectId, value, library } = payload;
    const state = getState() as RootState;
    let newFilterValue = simpleSelectFilterById(state.filters, pageObjectId);

    if (!newFilterValue) {
      newFilterValue = { pageObjectId, [FilterKey.JDIclassFilter]: jdiClassFilterInit(library) };
    }
    const newFilter = { ...newFilterValue[FilterKey.JDIclassFilter] };
    Object.keys(newFilter).forEach((key: string) => {
      // don't know how to fix it
      //@ts-ignore
      newFilter[key] = value;
    });

    if (!getLocalStorage(LocalStorageKey.Filter)) {
      setLocalStorage(LocalStorageKey.Filter, { [library]: newFilter });
    } else {
      const savedFilters = getLocalStorage(LocalStorageKey.Filter);
      setLocalStorage(LocalStorageKey.Filter, { ...savedFilters, [library]: newFilter });
    }

    return { newFilterValue, newFilter };
  }
);

export const toggleClassFilterAllReducer = (builder: any) => {
  return builder
    .addCase(
      toggleClassFilterAll.fulfilled,
      (state: any, { payload }: { payload: { newFilterValue: Filter; newFilter: ClassFilterValue } }) => {
        const { newFilterValue, newFilter } = payload;
        filterAdapter.upsertOne(state, { ...newFilterValue, [FilterKey.JDIclassFilter]: newFilter });
      }
    )
    .addCase(toggleClassFilterAll.rejected, (state: RootState, { error }: { error: Error }) => {
      throw new Error(error.stack);
    });
};
