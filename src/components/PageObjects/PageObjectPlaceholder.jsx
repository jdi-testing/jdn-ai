import React from "react";
import Icon from "@ant-design/icons";

import PageBigSvg from "../../assets/page-big.svg";
import { Footnote } from "../common/Footnote";

export const PageObjectPlaceholder = () => {
  return (
    <div className="jdn__pageObject_placeholder">
      <Icon component={PageBigSvg} />
      <Footnote>There are no created page objects.</Footnote>
      <Footnote>{`Open the needed page and click the "New page object" button to get started.`}</Footnote>
    </div>
  );
};
