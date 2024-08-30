import { AnnotationType, LocatorType } from '../../../common/types/common';
import { LocatorTree } from '../utils/locatorsTreeUtils';
import { createLocatorsMap, getTaskStatus } from '../utils/utils';
import { checkForEscaped, fullEscapeLocatorString } from '../utils/escapeLocatorString';
import cn from 'classnames';
import { isLocatorListPage } from '../../../app/utils/helpers';
import { Locator } from '../Locator';
import { size } from 'lodash';
import React, { ReactNode } from 'react';
import { ILocator } from '../types/locator.types';
import { PageType } from '../../../app/types/mainSlice.types';
import { ElementLibrary } from '../types/generationClasses.types';

export const annotationTypeOptions: { value: AnnotationType; label: AnnotationType }[] = Object.values(
  AnnotationType,
).map((type) => {
  return {
    value: type,
    label: type,
  };
});

type TreeNode = {
  key: string;
  title: ReactNode;
  children: TreeNode[];
  disabled?: boolean;
  selectable?: boolean;
  className: string;
};

export const renderTreeNodes = (
  data: LocatorTree[],
  locators: ILocator[],
  currentPage: PageType,
  searchString: string,
  library: ElementLibrary,
): TreeNode[] => {
  const treeNodes: TreeNode[] = [];
  const map: Record<string, number> = {};

  const locatorsMap = createLocatorsMap(locators);

  const createTree = (_data: LocatorTree[]): TreeNode[] => {
    const childNodes: TreeNode[] = [];
    _data.forEach((element, index) => {
      const { elementId, children, parent_id, jdnHash, searchState, depth } = element;
      const locator = locatorsMap[elementId];
      const locatorTaskStatus = getTaskStatus(locator.locatorValue.xPathStatus, locator.locatorValue.cssSelectorStatus);

      if (locator.locatorType === LocatorType.linkText && !checkForEscaped(locator.locatorValue.output)) {
        locator.locatorValue.output = fullEscapeLocatorString(locator.locatorValue.output);
      }

      const className = cn({
        'jdn__tree-item--selected': locator?.isGenerated && isLocatorListPage(currentPage),
        'jdn__tree-item--active': locator?.active,
      });

      const node: TreeNode = {
        key: elementId,
        className,
        title: (
          <Locator
            {...{
              element: { ...locator, locatorTaskStatus },
              currentPage,
              library,
              depth,
              searchState,
              searchString,
              index,
            }}
          />
        ),
        children: size(children) && children ? createTree(children) : [],
      };

      childNodes.push(node);
      if (!parent_id.length) treeNodes.push(node);

      map[jdnHash] = index;
    });
    return childNodes;
  };

  createTree(data);

  return treeNodes;
};
