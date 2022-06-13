import React, { useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { size } from "lodash";
import { Tree } from "antd";

import { Locator } from "../Locator";
import { Notifications } from "./Notifications";
import { convertListToTree } from "../../../utils/helpers";
import { selectCurrentPage } from "../../../store/selectors/mainSelectors";
import { selectPageObjById, selectPageObjLocatorsByProbability } from "../../../store/selectors/pageObjectSelectors";
import CaretDownSvg from "../../../assets/caret-down.svg";
import { pageType } from "../../../utils/constants";
import { LocatorsProgress } from "./LocatorsProgress";

const { TreeNode } = Tree;

export const LocatorsTree = ({ pageObject: currentPageObject }) => {
  const [isProgressActive, setIsProgressActive] = useState(true);

  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector((_state) => selectPageObjLocatorsByProbability(_state, currentPageObject));
  const scrollToLocator = useSelector((_state) => _state.locators.scrollToLocator);
  const library = useSelector((_state) => selectPageObjById(_state, _state.pageObject.currentPageObject)).library;

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
        <Tree
          switcherIcon={<CaretDownSvg />}
          defaultExpandAll
        >
          {renderTreeNodes(locatorsTree)}
        </Tree>
      </div>
      <Notifications />
      <LocatorsProgress {...{ currentPageObject, isProgressActive, setIsProgressActive }} />
    </React.Fragment>
  );
};
