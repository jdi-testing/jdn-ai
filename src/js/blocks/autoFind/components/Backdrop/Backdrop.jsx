import React from "react";
import { useSelector } from "react-redux";
import './Backdrop.less';
export const Backdrop = () => {
  const isModalOpen = useSelector((state) => state.main.isModalOpen);

  if (isModalOpen) {
    return (
      <div className="backdrop"></div>
    );
  }
  return null;
};
