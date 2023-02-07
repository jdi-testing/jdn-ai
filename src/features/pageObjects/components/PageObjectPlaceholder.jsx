import React from "react";
import Icon from "@ant-design/icons";

import PageBigSvg from "../assets/page-big.svg";
import { Footnote } from "../../../common/components/footnote/Footnote";

export const PageObjectPlaceholder = () => {
  return (
    <div className="jdn__pageObject_placeholder">
      <Icon component={PageBigSvg} />
      <Footnote>No page objects created</Footnote>
      <Footnote>Open the desired page and click the &quot;+ Page object&quot; button to start</Footnote>
    </div>
  );
};
