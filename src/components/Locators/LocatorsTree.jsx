import React from "react";
import { size } from "lodash";
import { Tree } from "antd";
import { DownOutlined } from "@ant-design/icons";

import { Locator } from "./Locator";
import { Notifications } from "./Notifications";
import { generatedLocatorsTreeMock } from "../../__tests__/__mocks__/locatorsTree.mock";

const { TreeNode } = Tree;

export const LocatorsTree = () => {
  const renderTreeNodes = (data) => {
    return data.map((element) =>
      <TreeNode
        key={element.key}
        title={
          <Locator
            key={element.element_id}
            {...{ element }}
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
          {renderTreeNodes(generatedLocatorsTreeMock)}
        </Tree>
      </div>
      <Notifications />
    </div>
  );
};
