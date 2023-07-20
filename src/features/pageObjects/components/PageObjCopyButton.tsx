import React, { FC, MouseEvent, useState } from "react";

import { Button, Tooltip } from "antd";
import { getLocatorString } from "../../../common/utils/helpers";
import { CopySimple } from "phosphor-react";
import { Locator } from "../../locators/types/locator.types";
import { CopyTitle } from "../../../common/types/common";
import { copyToClipboard } from "../../../common/utils/copyToClipboard";

interface Props {
  elements: Locator[];
}

export const PageObjCopyButton: FC<Props> = ({ elements }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(CopyTitle.Copy);

  const getPageObjectForCopying = (locators: Locator[]) => {
    return locators.map(({ locator, type, name }) => getLocatorString(locator, type, name));
  };

  const handleCopy = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    const pageObject = getPageObjectForCopying(elements);
    copyToClipboard(pageObject);

    setTooltipTitle(CopyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === CopyTitle.Copied) setTooltipTitle(CopyTitle.Copy);
  };

  return (
    <Tooltip placement="bottom" title={copyTooltipTitle}>
      <Button
        className="jdn__itemsList-button jdn__pageObject_button-copy"
        icon={<CopySimple size={18} color="currentColor" />}
        onMouseEnter={handleMouseEnter}
        onClick={(e) => handleCopy(e)}
      />
    </Tooltip>
  );
};
