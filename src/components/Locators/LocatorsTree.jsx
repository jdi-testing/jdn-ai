import React, { useMemo } from "react";
import { useSelector } from "react-redux";
import { size } from "lodash";
import { Tree } from "antd";
import { DownOutlined } from "@ant-design/icons";

import { Locator } from "./Locator";
import { Notifications } from "./Notifications";
import { convertListToTree } from "../../utils/helpers";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { selectPageObjLocatorsByProbability } from "../../store/selectors/pageObjectSelectors";

const { TreeNode } = Tree;

export const LocatorsTree = ({ pageObject: currentPageObject }) => {
  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector((_state) => selectPageObjLocatorsByProbability(_state, currentPageObject));
  const scrollToLocator = useSelector((_state) => _state.locators.scrollToLocator);

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
        title={
          <Locator
            {...{ element: locatorsMap[element_id], currentPage }}
            scroll={scrollToLocator === element_id}
          />
        }
      >
        {size(children) ? renderTreeNodes(children) : null}
      </TreeNode>
    ));
  };

  return (
    <div className="jdn__locatorsList">
      <div className="jdn__locatorsList-content">
        <Tree switcherIcon={<DownOutlined />} defaultExpandAll>
          {renderTreeNodes(locatorsTree)}
        </Tree>
      </div>
      <Notifications />
    </div>
  );
};
