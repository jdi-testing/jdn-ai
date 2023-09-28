import { createAsyncThunk } from '@reduxjs/toolkit';
import { filterAdapter, simpleSelectFilterById } from '../filter.selectors';
import { RootState } from '../../../app/store/store';
import { FilterKey, Filter, ClassFilterValue } from '../types/filter.types';
import { jdiClassFilterInit } from '../utils/filterSet';
import { PageObjectId } from '../../pageObjects/types/pageObjectSlice.types';
import { ElementClass, ElementLibrary } from '../../locators/types/generationClasses.types';
import { LocalStorageKey, setLocalStorage, getLocalStorage } from '../../../common/utils/localStorage';

interface toggleClassFilterPayload {
  pageObjectId: PageObjectId;
  library: ElementLibrary;
  jdiClass: ElementClass;
  value: boolean;
}

interface toggleClassFilterReducerPayload {
  pageObjectId: PageObjectId;
  newFilterValue: Filter;
  initialFilter: ClassFilterValue;
  newFilter: ClassFilterValue;
}

export const toggleClassFilter = createAsyncThunk(
  'filter/toggleClassFilter',
  async (payload: toggleClassFilterPayload, { getState }) => {
    const { pageObjectId, jdiClass, value, library } = payload;

    const state = getState() as RootState;
    const newFilterValue = simpleSelectFilterById(state.filters, pageObjectId);

    const savedFilters = getLocalStorage(LocalStorageKey.Filter);
    let newFilter;
    const initialFilter = {
      ...jdiClassFilterInit(library),
      ...(savedFilters?.[library] && savedFilters[library]),
    };

    if (newFilterValue) {
      newFilter = { ...newFilterValue[FilterKey.JDIclassFilter], [jdiClass]: value };
      setLocalStorage(LocalStorageKey.Filter, { ...savedFilters, [library]: newFilter });
    } else {
      initialFilter[jdiClass] = value;
      setLocalStorage(LocalStorageKey.Filter, { ...(savedFilters ?? {}), [library]: initialFilter });
    }

    return { newFilterValue, newFilter, initialFilter, pageObjectId };
  },
);

export const toggleClassFilterReducer = (builder: any) => {
  return builder
    .addCase(toggleClassFilter.fulfilled, (state: any, { payload }: { payload: toggleClassFilterReducerPayload }) => {
      const { newFilterValue, newFilter, pageObjectId, initialFilter } = payload;

      if (newFilterValue) {
        filterAdapter.upsertOne(state, { ...newFilterValue, [FilterKey.JDIclassFilter]: newFilter });
      } else {
        filterAdapter.addOne(state, {
          pageObjectId,
          [FilterKey.JDIclassFilter]: { ...initialFilter },
        });
      }
    })
    .addCase(toggleClassFilter.rejected, (state: RootState, { error }: { error: Error }) => {
      throw new Error(error.stack);
    });
};
