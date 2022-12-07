import React, { useState } from "react";

import { Button, Tooltip } from "antd";
import {
  copyToClipboard,
  getLocatorString,
} from "../../../common/utils/helpers";
import { copyTitle } from "../../../common/constants/constants";
import { CopySimple } from "phosphor-react";

export const PageObjCopyButton = ({ elements }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(copyTitle.Copy);

  const getPageObjectForCopying = (locators) => {
    return locators
      .map(({ locator, type, name }) => getLocatorString(locator, type, name))
      .join("\n\n");
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
        className="jdn__locatorsList_button jdn__locatorsList_button-copy"
        icon={<CopySimple size={18} color="currentColor" />}
        onMouseEnter={handleMouseEnter}
        onClick={(e) => handleCopy(e, elements)}
      />
    </Tooltip>
  );
};
