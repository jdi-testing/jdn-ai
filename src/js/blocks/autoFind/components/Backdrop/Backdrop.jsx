import React from "react";
import {useAutoFind} from "../../autoFindProvider/AutoFindProvider";
import './Backdrop.less';
export const Backdrop = () => {
  const [
    {isXpathModalOpen},
  ] = useAutoFind();

  if (isXpathModalOpen) {
    return (
      <div className="backdrop"></div>
    );
  }
  return null;
};
