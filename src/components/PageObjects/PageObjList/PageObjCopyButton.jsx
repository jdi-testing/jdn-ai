import React, { useState } from "react";

import { Button, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import CopySvg from "../../../assets/copy.svg";
import { copyToClipboard, getLocatorString } from "../../../utils/helpers";
import { copyTitle } from "../../../utils/constants";

export const PageObjCopyButton = ({ elements }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(copyTitle.Copy);

  const getPageObjectForCopying = (locators) => {
    return locators.map(({ locator, type, name }) => getLocatorString(locator, type, name)).join("\n\n");
  };

  const handleCopy = (e, elements) => {
    e.stopPropagation();

    const pageObject = getPageObjectForCopying(elements);
    copyToClipboard(pageObject);

    setTooltipTitle(copyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === copyTitle.Copied) setTooltipTitle(copyTitle.Copy);
  };

  return (
    <Tooltip placement="bottom" title={copyTooltipTitle}>
      <Button
        type="text"
        icon={<Icon component={CopySvg} />}
        onMouseEnter={handleMouseEnter}
        onClick={(e) => handleCopy(e, elements)}
      />
    </Tooltip>
  );
};
