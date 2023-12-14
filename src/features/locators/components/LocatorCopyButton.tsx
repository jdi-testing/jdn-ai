import React, { useState, MouseEvent } from 'react';
import { Button, Tooltip } from 'antd';
import { CopySimple } from '@phosphor-icons/react';
import { CopyTitle, FrameworkType, LocatorType } from '../../../common/types/common';
import { getLocatorString, getFullLocatorVividusString } from '../utils/locatorOutput';
import { ILocator } from '../types/locator.types';
import { copyToClipboard } from '../../../common/utils/copyToClipboard';

interface Props {
  framework: FrameworkType;
  element: ILocator;
  pageObjectName: string;
}

export const LocatorCopyButton: React.FC<Props> = ({ framework, element, pageObjectName }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(CopyTitle.Copy);
  const { locatorValue, type, name, annotationType } = element;
  const isVividusFramework = framework === FrameworkType.Vividus;
  const locatorType = element?.locatorType || LocatorType.xPath;

  const handleCopy = (event: MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();

    const locatorString = isVividusFramework
      ? getFullLocatorVividusString(pageObjectName, locatorType, element)
      : getLocatorString(annotationType, locatorType, locatorValue, type, name);

    copyToClipboard(locatorString);
    setTooltipTitle(CopyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === CopyTitle.Copied) setTooltipTitle(CopyTitle.Copy);
  };

  return (
    <Tooltip placement="bottom" title={copyTooltipTitle} align={{ offset: [0, -10] }}>
      <Button
        onClick={handleCopy}
        onMouseEnter={handleMouseEnter}
        className="jdn__itemsList-button jdn__locatorsList_button-copy"
        icon={<CopySimple size={18} color="currentColor" />}
      />
    </Tooltip>
  );
};
