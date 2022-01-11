import React from "react";
import { useSelector } from "react-redux";
import './Backdrop.less';
export const Backdrop = () => {
  const showBackdrop = useSelector((state) => state.main.showBackdrop);

  if (showBackdrop) {
    return (
      <div className="backdrop"></div>
    );
  }
  return null;
};
