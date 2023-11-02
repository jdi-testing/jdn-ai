import { useDispatch } from 'react-redux';
import { addPageObj } from '../reducers/addPageObject.thunk';
import { AppDispatch } from '../../../app/store/store';
import { PageObject } from '../types/pageObjectSlice.types';

type TSetActivePanel = (pageObjectId: string[] | undefined) => void;

export const useAddPageObject = (setActivePanel: TSetActivePanel, hasDraftPageObject: PageObject | undefined) => {
  const dispatch = useDispatch<AppDispatch>();

  return async () => {
    if (hasDraftPageObject) {
      setActivePanel([hasDraftPageObject.id.toString()]);
    } else {
      setActivePanel([]);
      try {
        await dispatch(addPageObj());
      } catch (error) {
        console.error('Execution error addPageObj:', error);
      }
    }
  };
};
