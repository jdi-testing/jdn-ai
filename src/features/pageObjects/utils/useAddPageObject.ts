import { useDispatch } from 'react-redux';
import { addPageObj } from '../reducers/addPageObject.thunk';
import { AppDispatch } from '../../../app/store/store';

export const useAddPageObject = () => {
  const dispatch = useDispatch<AppDispatch>();

  return async () => {
    try {
      await dispatch(addPageObj());
    } catch (error) {
      console.error('Execution error addPageObj:', error);
    }
  };
};

// export const useAddPageObject = (setActivePanel: (pageObjectId: string[] | undefined) => void) => {
//   const pageObjects = useSelector(selectPageObjects);
//   const newPOstub = pageObjects.find((pageObject) => !pageObject.locators?.length);
//   const dispatch = useDispatch<AppDispatch>();

//   return () => {
//     if (newPOstub) {
//       return setActivePanel([newPOstub.id.toString()]);
//     }

//     dispatch(addPageObj());
//   };
// };
