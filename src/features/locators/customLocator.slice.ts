import { createSlice, PayloadAction } from '@reduxjs/toolkit';

interface CustomLocatorState {
  isCreatingFormOpen: boolean;
  isEditModalOpen: boolean;
}

const initialState: CustomLocatorState = {
  isCreatingFormOpen: false,
  isEditModalOpen: false,
};

const customLocatorSlice = createSlice({
  name: 'customLocator',
  initialState,
  reducers: {
    setIsCreatingFormOpen: (state, action: PayloadAction<boolean>) => {
      state.isCreatingFormOpen = action.payload;
    },
    setIsEditModalOpen: (state, action: PayloadAction<boolean>) => {
      state.isEditModalOpen = action.payload;
    },
  },
});

export const { setIsCreatingFormOpen, setIsEditModalOpen } = customLocatorSlice.actions;
export default customLocatorSlice.reducer;
