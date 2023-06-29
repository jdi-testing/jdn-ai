import { Button, Tooltip } from "antd";
import { CopySimple } from "phosphor-react";
import React, { useState } from "react";
import { copyToClipboard, getLocatorString } from "../../../common/utils/helpers";
import { CopyTitle } from "../../../common/types/common";

export const LocatorCopyButton = ({ element }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(CopyTitle.Copy);
  const { locator, type, name } = element;

  const handleCopy = (event) => {
    event.stopPropagation();
    const locatorString = getLocatorString(locator, type, name);
    copyToClipboard(locatorString);
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
          className="jdn__locatorsList_button jdn__locatorsList_button-copy"
          icon={<CopySimple size={18} color="currentColor" />}
        />
      </Tooltip>
    </React.Fragment>
  );
};
