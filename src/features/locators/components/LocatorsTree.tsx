import React, { ReactNode, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Tree } from 'antd';
import { size } from 'lodash';
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
import { checkForEscaped, fullEscapeLocatorString } from '../utils/escapeLocatorString';
import { LocatorType } from '../../../common/types/common';
import type RcTree from 'rc-tree';
import cn from 'classnames';
import { getTaskStatus } from '../utils/utils';

import 'react-resizable/css/styles.css';
import '../../../common/styles/ResizableColumns.less';
import { Resizable, ResizeCallbackData } from 'react-resizable';

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

const LocatorsTreeComponent: React.FC<LocatorTreeProps> = ({ locatorIds, viewProps }) => {
  const [expandedKeys, setExpandedKeys] = useState(locatorIds);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const containerRef = useRef<HTMLDivElement>(null);
  const treeRefLeft = useRef<RcTree>(null);
  const treeRefRight = useRef<RcTree>(null);

  const containerHeight = useSize(containerRef)?.height;
  const [leftWidth, setLeftWidth] = useState<undefined | number>(undefined);

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
  // const framework = useSelector(selectCurrentPageObject)?.framework;

  useEffect(() => {
    if (expandAll === ExpandState.Expanded) setExpandedKeys(locatorIds);
    else if (expandAll === ExpandState.Collapsed) setExpandedKeys([]);
  }, [expandAll]);

  useEffect(() => {
    if (!scrollToLocator) return;
    if (!expandedKeys.includes(scrollToLocator)) {
      setAutoExpandParent(true);
      setExpandedKeys([...expandedKeys, scrollToLocator]);
    }
  }, [scrollToLocator]);

  const onExpand = useCallback(
    (expandedKeysValue: string[]) => {
      setExpandedKeys(expandedKeysValue);
      setAutoExpandParent(false);
      setExpandAll(ExpandState.Custom);
    },
    [setExpandAll],
  );

  const locatorsMap = createLocatorsMap(locators);

  const locatorsTree = useMemo(
    () => convertListToTree(locators, searchString),
    [currentPage, searchString, filteredLocators],
  );

  const renderTreeNodes = useCallback(
    (data: LocatorTree[]): TreeNode[] => {
      const treeNodes: TreeNode[] = [];
      const map: Record<string, number> = {};

      const createTree = (_data: LocatorTree[]): TreeNode[] => {
        const childNodes: TreeNode[] = [];
        _data.forEach((element, index) => {
          const { elementId, children, parent_id, jdnHash, searchState, depth } = element;
          const locator = locatorsMap[elementId];
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
    },
    [locatorsMap, currentPage, library, searchString],
  );

  const treeNodes = useMemo(() => renderTreeNodes(locatorsTree), [renderTreeNodes, locatorsTree]);

  useEffect(() => {
    if (scrollToLocator) {
      setTimeout(() => {
        if (treeRefLeft.current && containerHeight) {
          // antd docs for scrollTo https://github.com/ant-design/ant-design/blob/master/components/tree/index.en-US.md#tree-methods
          treeRefLeft.current.scrollTo({ key: scrollToLocator, align: 'top', offset: containerHeight / 2 });
        }
        if (treeRefRight.current && containerHeight) {
          treeRefRight.current.scrollTo({ key: scrollToLocator, align: 'top', offset: containerHeight / 2 });
        }
      }, 500);
    }
  }, [expandedKeys, scrollToLocator, containerHeight]);

  useEffect(() => {
    if (!containerRef.current) return;

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        const newWidth = entry.contentRect.width;
        setLeftWidth(Math.max(100, newWidth * 0.3));
      }
    });

    resizeObserver.observe(containerRef.current);

    return () => {
      resizeObserver.disconnect();
    };
  }, []);

  const handleResize = useCallback((e: React.SyntheticEvent<Element>, data: ResizeCallbackData) => {
    const newLeftWidth = data.size.width;
    setLeftWidth(newLeftWidth);
  }, []);

  return (
    <>
      <div ref={containerRef} className="jdn__locatorsTree-container--table">
        {containerRef.current && (
          <Resizable
            className="jdn__locatorsTree-left"
            width={leftWidth ?? 100}
            height={containerHeight || 0}
            minConstraints={[100, containerHeight || 0]}
            maxConstraints={[containerRef.current.clientWidth - 100, containerHeight || 0]}
            axis="x"
            handle={<span className="resizable-handle" />}
            onResize={handleResize}
          >
            <div style={{ width: leftWidth }}>
              {/* incompatible type of Key */}
              {/* eslint-disable-next-line */}
              {/* @ts-ignore */}
              <Tree
                ref={treeRefLeft}
                {...{ expandedKeys, onExpand, autoExpandParent }}
                switcherIcon={<CaretDown color="#878A9C" size={14} />}
                treeData={treeNodes}
                height={containerHeight || 0} // necessary for scrollTo works
                virtual={false}
              />
            </div>
          </Resizable>
        )}

        {containerRef.current && (
          <div className="jdn__locatorsTree-right">
            {/* incompatible type of Key */}
            {/* eslint-disable-next-line */}
            {/* @ts-ignore */}
            <Tree
              ref={treeRefRight}
              {...{ expandedKeys, onExpand, autoExpandParent }}
              switcherIcon={<CaretDown color="#878A9C" size={14} />}
              treeData={treeNodes}
              height={containerHeight || 0} // necessary for scrollTo works
              virtual={false}
            />
          </div>
        )}
      </div>
      <LocatorsProgress />
    </>
  );
};

export const LocatorsTree = React.memo(LocatorsTreeComponent);
