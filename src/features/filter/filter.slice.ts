import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { PageObjectId } from '../pageObjects/types/pageObjectSlice.types';
import { Filter, FilterKey } from './types/filter.types';
import { filterAdapter } from './filter.selectors';
import { toggleClassFilterReducer } from './reducers/toggleClassFilter.thunk';
import { toggleClassFilterAllReducer } from './reducers/toggleClassFilterAll.thunk';
import { getLocalStorage, LocalStorageKey, setLocalStorage } from '../../common/utils/localStorage';
import { ElementLibrary } from '../locators/types/generationClasses.types';
import { mapJDIclassesToFilter } from './utils/filterSet';

const filterSlice = createSlice({
  name: 'filter',
  initialState: filterAdapter.getInitialState({}),
  reducers: {
    removeAll(state) {
      filterAdapter.removeAll(state);
    },
    removeFilters(state, { payload }: PayloadAction<{ pageObjectIds: PageObjectId[] }>) {
      const { pageObjectIds } = payload;
      filterAdapter.removeMany(state, pageObjectIds);
    },
    clearFilters(
      state,
      { payload }: PayloadAction<{ pageObjectId: PageObjectId; library: ElementLibrary; isDefaultSetOn: boolean }>,
    ) {
      const { pageObjectId, library, isDefaultSetOn } = payload;
      if (!library) return;
      const savedFilters = getLocalStorage(LocalStorageKey.Filter);

      filterAdapter.upsertOne(state, {
        pageObjectId,
        [FilterKey.JDIclassFilter]: mapJDIclassesToFilter(library),
        isDefaultSetOn,
      });

      if (savedFilters && savedFilters[library]) {
        delete savedFilters[library];
      }

      setLocalStorage(LocalStorageKey.Filter, savedFilters);
    },
    setFilter(state, { payload }: PayloadAction<Filter>) {
      const { pageObjectId, JDIclassFilter, isDefaultSetOn } = payload;
      filterAdapter.upsertOne(state, {
        pageObjectId,
        [FilterKey.JDIclassFilter]: { ...JDIclassFilter },
        isDefaultSetOn,
      });
    },
    setDefaultFilterSetOn(state, { payload }: PayloadAction<{ pageObjectId: PageObjectId }>) {
      const { pageObjectId } = payload;
      const existingFilter = state.entities[pageObjectId];
      if (existingFilter) {
        existingFilter.isDefaultSetOn = true;
      }
    },
    setDefaultFilterSetOff(state, { payload }: PayloadAction<{ pageObjectId: PageObjectId }>) {
      const { pageObjectId } = payload;
      const existingFilter = state.entities[pageObjectId];
      if (existingFilter) {
        existingFilter.isDefaultSetOn = false;
      }
    },
  },
  extraReducers: (builder) => {
    toggleClassFilterReducer(builder);
    toggleClassFilterAllReducer(builder);
  },
});

export default filterSlice.reducer;
export const { removeAll, removeFilters, setFilter, setDefaultFilterSetOn, setDefaultFilterSetOff, clearFilters } =
  filterSlice.actions;
