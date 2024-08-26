import { createSelector } from '@reduxjs/toolkit';
import { RootState } from '../../../app/store/store';
import { ViewMode } from '../VividusView.slice';

const selectViewState = (state: RootState) => state.vividusView;

export const selectViewMode = createSelector(selectViewState, (viewState) => viewState.mode);

export const selectIsTableView = createSelector(selectViewMode, (mode) => mode === ViewMode.Table);

export const selectIsListView = createSelector(selectViewMode, (mode) => mode === ViewMode.List);
