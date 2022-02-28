import React from "react";
import Icon from "@ant-design/icons";

import PageBigSvg from "../../assets/page-big.svg";
import { Typography } from "antd";

export const PageObjectPlaceholder = () => {
  return (
    <div className="jdn__pageObject_placeholder">
      <Icon component={PageBigSvg} />
      <Typography>There are no created page objects.</Typography>
      <Typography>{`Open the needed page and click the "New page object" button to get started.`}</Typography>
    </div>
  );
};
