import React from "react";
import { useSelector } from "react-redux";
import { identificationStatus } from "../../../utils/constants";
import './Backdrop.less';
export const Backdrop = () => {
  const showBackdrop = useSelector((state) => state.main.showBackdrop);
  const status = useSelector((state) => state.locators.present.status);

  if (showBackdrop || status === identificationStatus.loading) {
    return (
      <div className="backdrop"></div>
    );
  }
  return null;
};
