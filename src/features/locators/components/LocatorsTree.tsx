import React, { memo, useEffect, useMemo, useRef, useState } from 'react';
import { Tree } from 'antd';
import { useSelector } from 'react-redux';
import { CaretDown } from '@phosphor-icons/react';

import { LocatorsProgress } from './LocatorsProgress';

import { RootState } from '../../../app/store/store';
import { selectCurrentPage } from '../../../app/main.selectors';
import { selectPresentLocatorsByPO } from '../selectors/locatorsByPO.selectors';
import { selectFilteredLocators } from '../selectors/locatorsFiltered.selectors';
import { useSize } from '../utils/useSize';
import { convertListToTree, setNewParents } from '../utils/locatorsTreeUtils';

import { ElementId } from '../types/locator.types';
import type RcTree from 'rc-tree';
import { renderTreeNodes } from './utils';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { defaultLibrary } from '../types/generationClasses.types';

export enum SearchState {
  None = 'none',
  Hidden = 'hidden',
}

export enum ExpandState {
  Expanded = 'Expanded',
  Collapsed = 'Collapsed',
  Custom = 'Custom',
}

export interface LocatorTreeProps {
  locatorIds: ElementId[];
  expandAll: ExpandState;
  setExpandAll: (val: ExpandState) => void;
  searchString: string;
}

const LocatorsTreeComponent: React.FC<LocatorTreeProps> = ({ locatorIds, expandAll, setExpandAll, searchString }) => {
  const [expandedKeys, setExpandedKeys] = useState(locatorIds);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const treeRef = useRef<RcTree>(null);

  const containerHeight = useSize(containerRef)?.height;

  const currentPage = useSelector(selectCurrentPage).page;
  const originalLocators = useSelector(selectPresentLocatorsByPO);
  const filteredLocators = useSelector(selectFilteredLocators);

  const locators =
    originalLocators.length !== filteredLocators.length
      ? setNewParents(originalLocators, filteredLocators || [])
      : originalLocators;

  const scrollToLocator = useSelector((_state: RootState) => _state.locators.present.scrollToLocator);

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

  const locatorsTree = useMemo(
    () => convertListToTree(locators, searchString),
    [currentPage, searchString, filteredLocators],
  );

  const library = useSelector(selectCurrentPageObject)?.library || defaultLibrary;

  const treeNodes = useMemo(() => {
    return renderTreeNodes(locatorsTree, locators, currentPage, searchString, library);
  }, [locatorsTree, locators, currentPage, searchString]);

  useEffect(() => {
    if (scrollToLocator) {
      setTimeout(() => {
        // antd docs for scrollTo https://github.com/ant-design/ant-design/blob/master/components/tree/index.en-US.md#tree-methods
        if (treeRef.current && containerHeight) {
          treeRef.current.scrollTo({ key: scrollToLocator, align: 'top', offset: containerHeight / 2 });
        }
      }, 500);
    }
  }, [expandedKeys, scrollToLocator]);

  return (
    <>
      <div ref={containerRef} className="jdn__locatorsTree-container">
        {/* incompatible type of Key */}
        {/* eslint-disable-next-line */}
        {/* @ts-ignore */}
        <Tree
          ref={treeRef}
          {...{ expandedKeys, onExpand, autoExpandParent }}
          switcherIcon={<CaretDown color="#878A9C" size={14} className="jdn__locator_caret-down" />}
          treeData={treeNodes}
          height={containerHeight || 0} // necessary for scrollTo works
          style={{ height: 'inherit' }}
        />
      </div>
      <LocatorsProgress />
    </>
  );
};

LocatorsTreeComponent.displayName = 'LocatorsTreeComponent';

export const LocatorsTree = memo(LocatorsTreeComponent);
