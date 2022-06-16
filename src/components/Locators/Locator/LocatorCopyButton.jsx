import React, { useState } from "react";
import { Button, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import { copyTitle } from "../../../utils/constants";
import { copyToClipboard, getLocatorString } from "../../../utils/helpers";
import CopySvg from "../../../assets/copy.svg";

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
          type="text"
          onClick={handleCopy}
          onMouseEnter={handleMouseEnter}
          className="jdn__buttons"
          icon={<Icon component={CopySvg} />}
        />
      </Tooltip>
    </React.Fragment>
  );
};
