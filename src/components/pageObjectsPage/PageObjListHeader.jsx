import React from "react";
import { useDispatch } from "react-redux";
import { Button } from "antd";
import Icon from "@ant-design/icons";

import PlusSvg from "../../assets/plus.svg";
import { addPageObj } from "../../store/thunks/addPageObject";

export const PageObjListHeader = () => {
  const dispatch = useDispatch();
  const handleAddPageObject = () => dispatch(addPageObj());

  return (
    <div className="jdn__locatorsList-header">
      <span className="jdn__locatorsList-header-title">Page Objects</span>
      <div className="jdn__locatorsList-header-buttons">
        <Button className="jdn__buttons" onClick={handleAddPageObject}>
          <Icon component={PlusSvg} />
          New page object
        </Button>
      </div>
    </div>
  );
};
