import React, { FC, MouseEvent, useState } from 'react';

import { Button, Tooltip } from 'antd';
import { CopySimple } from '@phosphor-icons/react';
import { ILocator } from '../../locators/types/locator.types';
import { CopyTitle, FrameworkType, LocatorType } from '../../../common/types/common';
import { getFullLocatorVividusString, getLocatorString } from '../../locators/utils/locatorOutput';
import { copyLocatorsToClipboard } from '../../locators/utils/copyLocatorToClipboard';
import { getLocatorStringForTableView } from '../utils/pageObjectTemplate';
import { useSelector } from 'react-redux';
import { selectIsTableView } from '../../locators/selectors/vivdusView.selectors';

interface Props {
  framework: FrameworkType;
  elements: ILocator[];
  pageObjectName: string;
}

export const PageObjCopyButton: FC<Props> = ({ framework, elements, pageObjectName }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(CopyTitle.Copy);
  const isVividusFramework = framework === FrameworkType.Vividus;
  const isTableView = useSelector(selectIsTableView);

  const getPageObjectForCopying = (locators: ILocator[], pageObjectNameForCopying: string) => {
    return locators.map((element) => {
      const { annotationType, locatorValue, type, name } = element;
      const locatorType = element?.locatorType || LocatorType.xPath;

      return isVividusFramework
        ? isTableView
          ? `|${element.name}|${getLocatorStringForTableView(pageObjectNameForCopying, element, locatorType)}|`
          : getFullLocatorVividusString(pageObjectNameForCopying, locatorType, element)
        : getLocatorString(annotationType, locatorType, locatorValue, type, name);
    });
  };

  const handleCopy = (e: MouseEvent<HTMLElement>) => {
    e.stopPropagation();

    const pageObject = getPageObjectForCopying(elements, pageObjectName);
    copyLocatorsToClipboard(pageObject, isVividusFramework);

    setTooltipTitle(CopyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === CopyTitle.Copied) setTooltipTitle(CopyTitle.Copy);
  };

  return (
    <Tooltip placement="bottom" title={copyTooltipTitle}>
      <Button
        className="jdn__items-list_button jdn__pageObject_button-copy"
        icon={<CopySimple size={18} color="currentColor" />}
        onMouseEnter={handleMouseEnter}
        onClick={(e) => handleCopy(e)}
      />
    </Tooltip>
  );
};
