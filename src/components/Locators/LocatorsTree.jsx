import React from "react";
import { useSelector } from "react-redux";
import { size } from "lodash";
import { Tree } from "antd";
import { DownOutlined } from "@ant-design/icons";

import { Locator } from "./Locator";
import { Notifications } from "./Notifications";
import { convertListToTree } from "../../utils/helpers";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { locatorsListMock } from "../../__tests__/__mocks__/locatorsList.mock";

const { TreeNode } = Tree;

export const LocatorsTree = () => {
  const currentPage = useSelector(selectCurrentPage).page;
  const xpathConfig = useSelector((state) => state.main.xpathConfig);

  const locatorsTree = convertListToTree(locatorsListMock);

  const renderTreeNodes = (data) => {
    return data.map((element) =>
      <TreeNode
        key={element.element_id}
        title={
          <Locator
          {...{ element, xpathConfig, currentPage }}
          />}
      >
        {size(element.children) ? renderTreeNodes(element.children) : null}
      </TreeNode>
    );
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
