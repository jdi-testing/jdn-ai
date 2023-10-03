import React from 'react';
import { useSelector } from 'react-redux';
import { IdentificationStatus, LocatorsGenerationStatus } from '../../features/locators/types/locator.types';
import { RootState } from '../store/store';
import '../styles/backdrop.less';
import { selectCurrentPage } from '../main.selectors';
import { PageType } from '../types/mainSlice.types';

export const Backdrop = () => {
  const showBackdrop = useSelector((state: RootState) => state.main.showBackdrop);
  const status = useSelector((state: RootState) => state.locators.present.status);
  const generationStatus = useSelector((state: RootState) => state.locators.present.generationStatus);
  const currentPage = useSelector(selectCurrentPage).page;

  if (
    showBackdrop ||
    status === IdentificationStatus.loading ||
    (status === IdentificationStatus.success &&
      generationStatus === LocatorsGenerationStatus.starting &&
      currentPage === PageType.PageObject)
  ) {
    return <div className="backdrop"></div>;
  }
  return null;
};
