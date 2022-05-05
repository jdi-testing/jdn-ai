import React from "react";
import { useSelector } from "react-redux";
import { Tree } from "antd";
import { DownOutlined } from '@ant-design/icons';

import { Locator } from "./Locator";
import { Notifications } from "./Notifications";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { generatedLocatorsTreeMock } from "../../__tests__/__mocks__/locatorsTree.mock";

const { TreeNode } = Tree;

export const LocatorsTree = () => {
  const currentPage = useSelector(selectCurrentPage).page;
  const xpathConfig = useSelector((state) => state.main.xpathConfig);

  const renderTreeNodes = (data) => {
    return data.map((element) => {
        if (element.children) {
            return (
                <TreeNode
                  title={      
                    <Locator
                      key={element.element_id}
                      {...{ element, xpathConfig, currentPage }}
                    />}
                  key={element.key}
                  dataRef={element}
                >
                    {renderTreeNodes(element.children)}
                </TreeNode>
            );
        }
        return (
                <TreeNode
                  {...element}
                  title={      
                    <Locator
                      key={element.element_id}
                      {...{ element, xpathConfig, currentPage }}
                    />}
                  key={element.key}
                  dataRef={element}
                />
              );
    });
}

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
