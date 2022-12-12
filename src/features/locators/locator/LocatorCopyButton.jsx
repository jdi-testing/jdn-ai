import { Button, Tooltip } from "antd";
import { CopySimple } from "phosphor-react";
import React, { useState } from "react";
import { copyTitle } from "../../../common/constants/constants";
import { copyToClipboard, getLocatorString } from "../../../common/utils/helpers";

export const LocatorCopyButton = ({ element }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(copyTitle.Copy);
  const { locator, type, name } = element;

  const handleCopy = () => {
    const locatorString = getLocatorString(locator, type, name);
    copyToClipboard(locatorString);
    setTooltipTitle(copyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === copyTitle.Copied) setTooltipTitle(copyTitle.Copy);
  };

  return (
    <React.Fragment>
      <Tooltip placement="bottom" title={copyTooltipTitle}>
        <Button
          onClick={handleCopy}
          onMouseEnter={handleMouseEnter}
          className="jdn__locatorsList_button jdn__locatorsList_button-copy"
          icon={<CopySimple size={18} color="currentColor" />}
        />
      </Tooltip>
    </React.Fragment>
  );
};
