import { Spin } from "antd";
import React from "react";

export const LocatorTreeSpinner = () => {
  return (
    <div className="jdn__locatorTree_spinner">
      <Spin tip="Preparing locators..." size="large" />
    </div>
  );
};
