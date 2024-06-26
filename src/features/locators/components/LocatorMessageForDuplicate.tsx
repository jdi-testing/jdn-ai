import React, { MouseEvent } from 'react';
import { useDispatch } from 'react-redux';
import { setActiveSingle, setScrollToLocator } from '../locators.slice';
import { ILocator } from '../types/locator.types';

interface LocatorMessageForDuplicateProps {
  closeDialog: () => void;
  duplicates?: ILocator[];
}

export const LocatorMessageForDuplicate: React.FC<LocatorMessageForDuplicateProps> = ({ closeDialog, duplicates }) => {
  const dispatch = useDispatch();

  dispatch(setScrollToLocator(''));

  const handleOnMessageClick = async (event: MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    closeDialog();

    if (duplicates?.length) {
      dispatch(setActiveSingle(duplicates[0]));
      dispatch(setScrollToLocator(duplicates[0].elementId));
    }
  };

  return (
    <span>
      Duplicate locator detected. Please, edit or{' '}
      <span className="jdn__locatorEdit-navigation" onClick={handleOnMessageClick}>
        refer to the original locator
      </span>{' '}
      for further actions.
    </span>
  );
};
