import React from "react";
import {useAutoFind} from "../../autoFindProvider/AutoFindProvider";
import './Backdrop.less';
export const Backdrop = () => {
  const [
    {isModalOpen},
  ] = useAutoFind();

  if (isModalOpen) {
    return (
      <div className="backdrop"></div>
    );
  }
  return null;
};
