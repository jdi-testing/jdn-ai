import React, { memo, useEffect, useMemo, useRef } from 'react';
import { Tree } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { CaretDown } from '@phosphor-icons/react';

import { LocatorsProgress } from './LocatorsProgress';
import { RootState } from '../../../app/store/store';
import { selectCurrentPage } from '../../../app/main.selectors';
import { selectPresentLocatorsByPO } from '../selectors/locatorsByPO.selectors';
import { selectFilteredLocators } from '../selectors/locatorsFiltered.selectors';
import { useSize } from '../utils/useSize';
import { convertListToTree, setNewParents } from '../utils/locatorsTreeUtils';
import { renderTreeNodes } from './utils';
import { selectCurrentPageObject } from '../../pageObjects/selectors/pageObjects.selectors';
import { defaultLibrary } from '../types/generationClasses.types';

import type RcTree from 'rc-tree';
import { onExpand } from '../locators.slice';
import { selectOnExpandState } from '../selectors/locators.selectors';

export enum SearchState {
  None = 'none',
  Hidden = 'hidden',
}

export enum ExpandState {
  Expanded = 'Expanded',
  Collapsed = 'Collapsed',
  // Custom = 'Custom',
}

export interface LocatorTreeProps {
  searchString: string;
  onScroll?: (scrollPosition: number) => void;
}

const LocatorsTreeComponent: React.FC<LocatorTreeProps> = ({ searchString, onScroll }) => {
  const dispatch = useDispatch();

  const { expandedKeys } = useSelector(selectOnExpandState);

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
    if (!scrollToLocator) return;
    if (!expandedKeys.includes(scrollToLocator)) {
      dispatch(onExpand([...expandedKeys, scrollToLocator]));
    }
  }, [scrollToLocator, expandedKeys, dispatch]);

  const handleExpand = (expandedKeysValue: string[]) => {
    dispatch(onExpand(expandedKeysValue));
  };

  const locatorsTree = useMemo(
    () => convertListToTree(locators, searchString),
    [currentPage, searchString, filteredLocators],
  );

  const library = useSelector(selectCurrentPageObject)?.library || defaultLibrary;

  const treeNodes = useMemo(() => {
    return renderTreeNodes(locatorsTree, locators, currentPage, searchString, library);
  }, [locatorsTree, locators, currentPage, searchString, library]);

  useEffect(() => {
    if (scrollToLocator) {
      setTimeout(() => {
        if (treeRef.current && containerHeight) {
          treeRef.current.scrollTo({ key: scrollToLocator, align: 'top', offset: containerHeight / 2 });
        }
      }, 500);
    }
  }, [expandedKeys, scrollToLocator]);

  useEffect(() => {
    const scrollContainer = containerRef.current?.querySelector('.ant-tree-list-holder');
    if (!scrollContainer) return;

    const handleScroll = () => {
      const currentScrollPosition = scrollContainer.scrollTop;
      if (onScroll) {
        onScroll(currentScrollPosition);
      }
    };

    scrollContainer.addEventListener('scroll', handleScroll);

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [onScroll]);

  return (
    <>
      <div ref={containerRef} className="jdn__locatorsTree-container">
        {/* incompatible type of Key */}
        {/* eslint-disable-next-line */}
        {/* @ts-ignore */}
        <Tree
          ref={treeRef}
          {...{ expandedKeys, onExpand: handleExpand }}
          autoExpandParent={true}
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
