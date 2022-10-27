import React, { ReactNode, useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { size } from "lodash";
import { Tree } from "antd";

import { Locator } from "../Locator";
import { Notifications } from "./Notifications";
import { selectCurrentPage } from "../../../store/selectors/mainSelectors";
import {
  selectCurrentPageObject,
  selectPageObjLocatorsByProbability,
} from "../../../store/selectors/pageObjectSelectors";
import { pageType } from "../../../utils/constants";
import { CaretDown } from "phosphor-react";
import { LocatorsProgress } from "./LocatorsProgress";
import { EXPAND_STATE } from "../LocatorListHeader";
import { applySearch, convertListToTree, LocatorTree } from "./utils";
import { PageObjectId } from "../../../store/slices/pageObjectSlice.types";
import { ElementId, Locator as LocatorType } from "../../../store/slices/locatorSlice.types";
import { RootState } from "../../../store/store";
import { defaultLibrary } from "../../PageObjects/utils/generationClassesMap";

export enum SearchState {
  None = "none",
  Disabled = "disabled",
  Hidden = "hidden",
}

enum ExpandState {
  Expanded = "Expanded",
  Collapsed = "Collapsed",
  Custom = "Custom",
}

interface Props {
  pageObject: PageObjectId;
  locatorIds: Array<ElementId>;
  viewProps: { expandAll: ExpandState; setExpandAll: (val: ExpandState) => void };
  searchString: string;
}

type TreeNode = {
  key: string;
  title: ReactNode;
  children: Array<TreeNode>;
  searchState: SearchState | undefined;
  disabled?: boolean;
  disableCheckbox: boolean;
  selectable?: boolean;
  className: string;
  style: Record<string, string>;
};

export const LocatorsTree: React.FC<Props> = ({
  pageObject: currentPageObject,
  locatorIds,
  viewProps,
  searchString,
}) => {
  const [expandedKeys, setExpandedKeys] = useState(locatorIds);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const { expandAll, setExpandAll } = viewProps;

  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector((_state: RootState) => selectPageObjLocatorsByProbability(_state, currentPageObject));
  const scrollToLocator = useSelector((_state: RootState) => _state.locators.present.scrollToLocator);
  const library = useSelector(selectCurrentPageObject)?.library || defaultLibrary;

  useEffect(() => {
    if (expandAll === EXPAND_STATE.EXPANDED) setExpandedKeys(locatorIds);
    else if (expandAll === EXPAND_STATE.COLLAPSED) setExpandedKeys([]);
  }, [expandAll]);

  useEffect(() => {
    if (!scrollToLocator) return;
    // eslint-disable-next-line
    // @ts-ignore
    if (!expandedKeys.includes[scrollToLocator]) {
      setExpandedKeys([...expandedKeys, scrollToLocator]);
      setAutoExpandParent(true);
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

  const locatorsTree = useMemo(() => convertListToTree(locators), [currentPage]);

  const renderTreeNodes = (data: Array<LocatorTree>): Array<TreeNode> => {
    const treeNodes: Array<TreeNode> = [];
    const rootMap: Record<string, number> = {};
    const map: Record<string, number> = {};
    const searchedChilds: Array<LocatorTree> = [];

    // create tree
    const createTree = (_data: Array<LocatorTree>): Array<TreeNode> => {
      const childNodes: Array<TreeNode> = [];
      _data.forEach((element, i) => {
        const { element_id, children, parent_id, jdnHash } = element;
        const searchState = searchString ? applySearch(locatorsMap[element_id], searchString) : undefined;
        const disabled = searchState === SearchState.Disabled;
        const hidden = searchState === SearchState.Hidden;

        const node: TreeNode = {
          key: element_id,
          className: `${
            locatorsMap[element_id].generate && currentPage === pageType.locatorsList ? "jdn__tree-item--selected" : ""
          }${locatorsMap[element_id].isCmHighlighted ? " jdn__tree-item--cm-selected" : ""}`,
          style: { display: hidden ? "none" : "flex" },
          title: (
            <Locator
              {...{ element: locatorsMap[element_id], currentPage, library, searchState }}
              scroll={scrollToLocator === element_id}
            />
          ),
          children: size(children) && children ? createTree(children) : [],
          searchState,
          disableCheckbox: disabled,
        };

        childNodes.push(node);
        if (!parent_id.length) treeNodes.push(node);

        map[jdnHash] = i;
        if (searchState === SearchState.None && parent_id.length) searchedChilds.push(element);
        if (!parent_id.length) rootMap[element_id] = i;
      });
      return childNodes;
    };

    createTree(data);

    // to show disabled root parents
    const findParent = (element: LocatorTree) => {
      const { parent_id } = element;
      const parentElementIndex = map[parent_id];
      const parentElement = data[parentElementIndex];
      const treeIndex = rootMap[parentElement.element_id];
      if (parentElement.parent_id.length) {
        findParent(parentElement);
      } else if (treeNodes[treeIndex].searchState === SearchState.Hidden) {
        treeNodes[treeIndex].searchState = SearchState.Disabled;
        treeNodes[treeIndex].style = { display: "flex" };
        treeNodes[treeIndex].title = (
          <Locator
            {...{
              element: locatorsMap[parentElement.element_id],
              currentPage,
              library,
              searchState: SearchState.Disabled,
            }}
            scroll={scrollToLocator === parentElement.element_id}
          />
        );
      }
    };

    // show root parents
    searchedChilds.forEach((element) => {
      findParent(element);
    });

    return treeNodes;
  };

  return (
    <React.Fragment>
      <div className="jdn__locatorsTree-container">
        {/* incompatible type of Key */}
        {/* eslint-disable-next-line */}
        {/* @ts-ignore */}
        <Tree
          {...{ expandedKeys, onExpand, autoExpandParent }}
          switcherIcon={<CaretDown color="#878A9C" size={14} />}
          treeData={renderTreeNodes(locatorsTree)}
        />
      </div>
      <Notifications />
      <LocatorsProgress {...{ currentPageObject }} />
    </React.Fragment>
  );
};
