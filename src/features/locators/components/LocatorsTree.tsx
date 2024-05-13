/* eslint-disable @typescript-eslint/naming-convention */
import { Tree } from 'antd';
import { size } from 'lodash';
import React, { ReactNode, useEffect, useMemo, useRef, useState } from 'react';
import { useSelector } from 'react-redux';
import { CaretDown } from '@phosphor-icons/react';
import { selectCurrentPage } from '../../../app/main.selectors';
import { RootState } from '../../../app/store/store';
import { ElementId, ILocator } from '../types/locator.types';
import { defaultLibrary } from '../types/generationClasses.types';
import { LocatorsProgress } from './LocatorsProgress';
import { useSize } from '../utils/useSize';
import { convertListToTree, LocatorTree, setNewParents } from '../utils/locatorsTreeUtils';
import { Locator } from '../Locator';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { selectPresentLocatorsByPO } from '../selectors/locatorsByPO.selectors';
import { selectFilteredLocators } from '../selectors/locatorsFiltered.selectors';
import { isLocatorListPage } from '../../../app/utils/helpers';
import { fullEscapeLocatorString, checkForEscaped } from '../utils/escapeLocatorString';
import { LocatorType } from '../../../common/types/common';
import type RcTree from 'rc-tree';
import cn from 'classnames';
import { getTaskStatus } from '../utils/utils';

export enum SearchState {
  None = 'none',
  Disabled = 'disabled',
  Hidden = 'hidden',
}

export enum ExpandState {
  Expanded = 'Expanded',
  Collapsed = 'Collapsed',
  Custom = 'Custom',
}

export interface LocatorTreeProps {
  locatorIds: Array<ElementId>;
  viewProps: {
    expandAll: ExpandState;
    setExpandAll: (val: ExpandState) => void;
    searchString: string;
  };
}

type TreeNode = {
  key: string;
  title: ReactNode;
  children: Array<TreeNode>;
  disabled?: boolean;
  selectable?: boolean;
  className: string;
};

export const LocatorsTree: React.FC<LocatorTreeProps> = ({ locatorIds, viewProps }) => {
  const [expandedKeys, setExpandedKeys] = useState(locatorIds);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<RcTree>(null);

  const containerHeight = useSize(containerRef)?.height;

  const { expandAll, setExpandAll, searchString } = viewProps;

  const currentPage = useSelector(selectCurrentPage).page;
  const originalLocators = useSelector(selectPresentLocatorsByPO);
  const filteredLocators = useSelector(selectFilteredLocators);
  const locators =
    originalLocators.length !== filteredLocators.length
      ? setNewParents(originalLocators, filteredLocators || [])
      : originalLocators;

  const scrollToLocator = useSelector((_state: RootState) => _state.locators.present.scrollToLocator);
  const library = useSelector(selectCurrentPageObject)?.library || defaultLibrary;

  useEffect(() => {
    if (expandAll === ExpandState.Expanded) setExpandedKeys(locatorIds);
    else if (expandAll === ExpandState.Collapsed) setExpandedKeys([]);
  }, [expandAll]);

  useEffect(() => {
    if (!scrollToLocator) return;
    // eslint-disable-next-line
    // @ts-ignore
    if (!expandedKeys.includes[scrollToLocator]) {
      setAutoExpandParent(true);
      setExpandedKeys([...expandedKeys, scrollToLocator]);
    }
  }, [scrollToLocator]);

  const onExpand = (expandedKeysValue: string[]) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
    setExpandAll(ExpandState.Custom);
  };

  const createLocatorsMap = () => {
    const map: Record<ElementId, ILocator> = {};
    for (let index = 0; index < locators.length; index++) {
      map[locators[index].element_id] = locators[index];
    }
    return map;
  };

  const locatorsMap = createLocatorsMap();

  const locatorsTree = useMemo(
    () => convertListToTree(locators, searchString),
    [currentPage, searchString, filteredLocators],
  );

  const renderTreeNodes = (data: LocatorTree[]): TreeNode[] => {
    const treeNodes: TreeNode[] = [];
    const map: Record<string, number> = {};

    // create tree
    const createTree = (_data: LocatorTree[]): TreeNode[] => {
      const childNodes: TreeNode[] = [];
      _data.forEach((element, index) => {
        const { element_id, children, parent_id, jdnHash, searchState, depth } = element;
        const locator = locatorsMap[element_id];
        const locatorTaskStatus = getTaskStatus(
          locator.locatorValue.xPathStatus,
          locator.locatorValue.cssSelectorStatus,
        );

        if (locator.locatorType === LocatorType.linkText && !checkForEscaped(locator.locatorValue.output)) {
          locator.locatorValue.output = fullEscapeLocatorString(locator.locatorValue.output);
        }

        const className = cn({
          'jdn__tree-item--selected': locator?.isGenerated && isLocatorListPage(currentPage),
          'jdn__tree-item--active': locator?.active,
        });

        const node: TreeNode = {
          key: element_id,
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

  const treeNodes = renderTreeNodes(locatorsTree);

  useEffect(() => {
    if (scrollToLocator) {
      setTimeout(() => {
        // antd docs for scrollTo https://github.com/ant-design/ant-design/blob/master/components/tree/index.en-US.md#tree-methods
        if (treeRef.current && containerHeight) {
          treeRef.current.scrollTo({ key: scrollToLocator, align: 'top', offset: containerHeight / 2 });
        }
      }, 500);
    }
  }, [expandedKeys]);

  return (
    <>
      <div ref={containerRef} className="jdn__locatorsTree-container">
        {/* incompatible type of Key */}
        {/* eslint-disable-next-line */}
        {/* @ts-ignore */}
        <Tree
          ref={treeRef}
          {...{ expandedKeys, onExpand, autoExpandParent }}
          switcherIcon={<CaretDown color="#878A9C" size={14} />}
          treeData={treeNodes}
          height={containerHeight || 0} // necessary for scrollTo works
          style={{ height: 'inherit' }}
        />
      </div>
      <LocatorsProgress />
    </>
  );
};
