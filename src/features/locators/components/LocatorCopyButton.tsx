import { Button, Tooltip } from "antd";
import { CopySimple } from "@phosphor-icons/react";
import React, { useState, MouseEvent } from "react";
import { CopyTitle, FrameworkType } from "../../../common/types/common";
import { getLocatorString, getFullLocatorVividusString } from "../utils/locatorOutput";
import { copyLocatorToClipboard } from "../utils/copyLocatorToClipboard";
import { ILocator } from "../types/locator.types";
import { camelCase } from "lodash";

interface Props {
  framework: FrameworkType;
  element: ILocator;
}

export const LocatorCopyButton: React.FC<Props> = ({ framework, element }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(CopyTitle.Copy);
  const { locator, type, name, annotationType, locatorType } = element;
  const isVividusFramework = framework === FrameworkType.Vividus;

  const handleCopy = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const locatorString = isVividusFramework
      ? getFullLocatorVividusString(name, camelCase(locatorType), element)
      : getLocatorString(annotationType, locatorType, locator, type, name);

    copyLocatorToClipboard(locatorString);
    setTooltipTitle(CopyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === CopyTitle.Copied) setTooltipTitle(CopyTitle.Copy);
  };

  return (
    <>
      <Tooltip placement="bottom" title={copyTooltipTitle} align={{ offset: [0, -10] }}>
        <Button
          onClick={handleCopy}
          onMouseEnter={handleMouseEnter}
          className="jdn__itemsList-button jdn__locatorsList_button-copy"
          icon={<CopySimple size={18} color="currentColor" />}
        />
      </Tooltip>
    </>
  );
};
