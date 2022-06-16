import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { size } from "lodash";
import { Tree } from "antd";

import { Locator } from "../Locator";
import { Notifications } from "./Notifications";
import { convertListToTree } from "../../../utils/helpers";
import { selectCurrentPage } from "../../../store/selectors/mainSelectors";
import { selectPageObjById, selectPageObjLocatorsByProbability } from "../../../store/selectors/pageObjectSelectors";
import { pageType } from "../../../utils/constants";
import { CaretDown } from "phosphor-react";
import { LocatorsProgress } from "./LocatorsProgress";
import { EXPAND_STATE } from "../LocatorListHeader";

const { TreeNode } = Tree;

export const LocatorsTree = ({ pageObject: currentPageObject, locatorIds, viewProps }) => {
  const [expandedKeys, setExpandedKeys] = useState(locatorIds);
  const [autoExpandParent, setAutoExpandParent] = useState(true);

  const { expandAll, setExpandAll } = viewProps;

  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector((_state) => selectPageObjLocatorsByProbability(_state, currentPageObject));
  const scrollToLocator = useSelector((_state) => _state.locators.scrollToLocator);
  const library = useSelector((_state) => selectPageObjById(_state, _state.pageObject.currentPageObject)).library;

  useEffect(() => {
    if (expandAll === EXPAND_STATE.EXPANDED) setExpandedKeys(locatorIds);
    else if (expandAll === EXPAND_STATE.COLLAPSED) setExpandedKeys([]);
  }, [expandAll]);

  useEffect(() => {
    if (!scrollToLocator) return;
    if (!expandedKeys.includes[scrollToLocator]) {
      setExpandedKeys([...expandedKeys, scrollToLocator]);
      setAutoExpandParent(true);
    }
  }, [scrollToLocator]);

  const onExpand = (expandedKeysValue) => {
    setExpandedKeys(expandedKeysValue);
    setAutoExpandParent(false);
    setExpandAll(EXPAND_STATE.CUSTOM);
  };

  const createLocatorsMap = () => {
    const map = {};
    for (let index = 0; index < locators.length; index++) {
      map[locators[index].element_id] = locators[index];
    }
    return map;
  };

  const locatorsMap = createLocatorsMap();

  const locatorsTree = useMemo(() => convertListToTree(locators), [currentPage]);

  const renderTreeNodes = (data) => {
    return data.map(({ element_id, children }) => (
      <TreeNode
        key={element_id}
        className={`
        ${locatorsMap[element_id].generate && currentPage === pageType.locatorsList ? "jdn__tree-item--selected" : ""}
        ${locatorsMap[element_id].isCmHighlighted ? "jdn__tree-item--cm-selected" : ""}`}
        title={
          <Locator
            {...{ element: locatorsMap[element_id], currentPage, library }}
            scroll={scrollToLocator === element_id}
          />
        }
      >
        {size(children) ? renderTreeNodes(children) : null}
      </TreeNode>
    ));
  };

  return (
    <React.Fragment>
      <div className="jdn__locatorsTree-container">
        <Tree {...{ expandedKeys, onExpand, autoExpandParent }} switcherIcon={<CaretDown color="#878A9C" size={14} />}>
          {renderTreeNodes(locatorsTree)}
        </Tree>
      </div>
      <Notifications />
      <LocatorsProgress {...{ currentPageObject }} />
    </React.Fragment>
  );
};
