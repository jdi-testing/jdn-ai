import { Button, Tooltip } from "antd";
import { CopySimple } from "phosphor-react";
import React, { useState } from "react";
import { CopyTitle } from "../../../common/types/common";
import { getLocatorString } from "../../locators/utils/locatorOutput";
import { copyLocatorToClipboard } from "../utils/copyLocatorToClipboard";

export const LocatorCopyButton = ({ element }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(CopyTitle.Copy);
  const { locator, type, name, annotationType, locatorType } = element;

  const handleCopy = (event) => {
    event.stopPropagation();
    const locatorString = getLocatorString(annotationType, locatorType, locator, type, name);
    copyLocatorToClipboard(locatorString);
    setTooltipTitle(CopyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === CopyTitle.Copied) setTooltipTitle(CopyTitle.Copy);
  };

  return (
    <React.Fragment>
      <Tooltip placement="bottom" title={copyTooltipTitle} align={{ offset: [0, -10] }}>
        <Button
          onClick={handleCopy}
          onMouseEnter={handleMouseEnter}
          className="jdn__itemsList-button jdn__locatorsList_button-copy"
          icon={<CopySimple size={18} color="currentColor" />}
        />
      </Tooltip>
    </React.Fragment>
  );
};
