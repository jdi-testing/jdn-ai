import React from "react";
import { useSelector } from "react-redux";
import { IdentificationStatus, LocatorsGenerationStatus } from "../../features/locators/types/locator.types";
import { RootState } from "../store/store";
import "../styles/backdrop.less";

export const Backdrop = () => {
  const showBackdrop = useSelector((state: RootState) => state.main.showBackdrop);
  const status = useSelector((state: RootState) => state.locators.present.status);
  const generationStatus = useSelector((state: RootState) => state.locators.present.generationStatus);

  if (
    showBackdrop ||
    status === IdentificationStatus.loading ||
    status === IdentificationStatus.success ||
    generationStatus === LocatorsGenerationStatus.starting
  ) {
    return <div className="backdrop"></div>;
  }
  return null;
};
