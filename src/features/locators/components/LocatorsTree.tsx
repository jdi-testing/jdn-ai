import { Tree } from "antd";
import { size } from "lodash";
import React, { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { CaretDown } from "phosphor-react";
import { selectCurrentPage } from "../../../app/main.selectors";
import { RootState } from "../../../app/store/store";
import { ElementId, Locator as LocatorType } from "../types/locator.types";
import { defaultLibrary } from "../types/generationClasses.types";
import { LocatorsProgress } from "./LocatorsProgress";
import { useSize } from "../utils/useSize";
import { convertListToTree, LocatorTree, setNewParents } from "../utils/locatorsTreeUtils";
import { Locator } from "../Locator";
import { Notifications } from "../../../common/components/notification/Notifications";
import { selectCurrentPageObject } from "../../pageObjects/selectors/pageObjects.selectors";
import { selectPresentLocatorsByPO } from "../selectors/locatorsByPO.selectors";
import { selectFilteredLocators } from "../selectors/locatorsFiltered.selectors";
import { isLocatorListPage } from "../../../app/utils/heplers";

export enum SearchState {
  None = "none",
  Disabled = "disabled",
  Hidden = "hidden",
}

export enum ExpandState {
  Expanded = "Expanded",
  Collapsed = "Collapsed",
  Custom = "Custom",
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
  const treeRef = useRef(null);

  const containerHeight = useSize(containerRef)?.height;

  const { expandAll, setExpandAll, searchString } = viewProps;

  const currentPage = useSelector(selectCurrentPage).page;
  const origLocators = useSelector(selectPresentLocatorsByPO);
  const filteredLocators = useSelector(selectFilteredLocators);
  const locators =
    size(origLocators) !== size(filteredLocators) ? setNewParents(origLocators, filteredLocators || []) : origLocators;
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
    const map: Record<ElementId, LocatorType> = {};
    for (let index = 0; index < locators.length; index++) {
      map[locators[index].element_id] = locators[index];
    }
    return map;
  };

  const locatorsMap = createLocatorsMap();

  const locatorsTree = useMemo(() => convertListToTree(locators, searchString), [
    currentPage,
    searchString,
    filteredLocators,
  ]);

  const renderTreeNodes = (data: Array<LocatorTree>): Array<TreeNode> => {
    const treeNodes: Array<TreeNode> = [];
    const map: Record<string, number> = {};

    // create tree
    const createTree = (_data: Array<LocatorTree>): Array<TreeNode> => {
      const childNodes: Array<TreeNode> = [];
      _data.forEach((element, i) => {
        const { element_id, children, parent_id, jdnHash, searchState, depth } = element;

        const node: TreeNode = {
          key: element_id,
          className: `${
            locatorsMap[element_id].generate && isLocatorListPage(currentPage) ? "jdn__tree-item--selected" : ""
          }${locatorsMap[element_id].active ? " jdn__tree-item--active" : ""}`,
          title: (
            <Locator
              {...{
                element: locatorsMap[element_id],
                currentPage,
                library,
                depth,
                searchState,
                searchString,
              }}
            />
          ),
          children: size(children) && children ? createTree(children) : [],
        };

        childNodes.push(node);
        if (!parent_id.length) treeNodes.push(node);

        map[jdnHash] = i;
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
        treeRef.current &&
          containerHeight &&
          // bug in ant's typings, impossible to create correct ref type
          // eslint-disable-next-line
          // @ts-ignore
          treeRef.current.scrollTo({ key: scrollToLocator, align: "top", offset: containerHeight / 2 });
      }, 500);
    }
  }, [expandedKeys]);

  return (
    <React.Fragment>
      <div ref={containerRef} className="jdn__locatorsTree-container">
        {/* incompatible type of Key */}
        {/* eslint-disable-next-line */}
        {/* @ts-ignore */}
        <Tree
          ref={treeRef}
          {...{ expandedKeys, onExpand, autoExpandParent }}
          switcherIcon={<CaretDown color="#878A9C" size={14} />}
          treeData={treeNodes}
          height={containerHeight || 0}
        />
      </div>
      <Notifications />
      <LocatorsProgress />
    </React.Fragment>
  );
};
