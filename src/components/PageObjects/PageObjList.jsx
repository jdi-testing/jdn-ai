import React, { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import { Collapse, Dropdown, Menu, Typography } from "antd";
import { size } from "lodash";

import { PageObjListHeader } from "./PageObjListHeader";

import CaretDownSvg from "../../assets/caret-down.svg";
import PageSvg from "../../assets/page.svg";
import EllipsisSvg from "../../assets/ellipsis.svg";
import TrashBinSvg from "../../assets/trash-bin.svg";
import { selectConfirmedLocators, selectPageObjects } from "../../store/selectors/pageObjectSelectors";
import { Locator } from "../Locators/Locator";
import { GenerationButtons } from "./GenerationButtons";
import { PageObjectPlaceholder } from "./PageObjectPlaceholder";
import { removePageObject } from "../../store/slices/pageObjectSlice";
import { removeLocators } from "../../store/slices/locatorsSlice";

export const PageObjList = () => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);
  const pageObjects = useSelector(selectPageObjects);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const [activePanel, setActivePanel] = useState([]);

  useEffect(() => {
    setActivePanel([currentPageObject]);
  }, [currentPageObject]);

  const renderLocators = (elements) => {
    if (size(elements)) {
      return elements.map((element) => (
        <Locator key={element.element_id} {...{ element, xpathConfig }} noScrolling={true} />
      ));
    } else {
      return "No locators selected";
    }
  };

  const renderPageObjSettings = (pageObjId, url) => {
    return (
      <div className="jdn__pageObject__settings">
        <div className="jdn__pageObject__settings-url">{url}</div>
        <GenerationButtons pageObj={pageObjId} />
      </div>
    );
  };

  const renderContent = (pageObjId, url) => {
    const elements = selectConfirmedLocators(state, pageObjId);
    if (size(elements)) {
      return renderLocators(elements);
    } else {
      return renderPageObjSettings(pageObjId, url);
    }
  };

  const renderMenu = (id, locators) => {
    const handleRemove = () => {
      dispatch(removePageObject(id));
      dispatch(removeLocators(locators));
    };
    return (
      <Menu>
        <Menu.Item key="6" icon={<TrashBinSvg />} onClick={() => handleRemove()}>
          <Typography.Text type="danger">Delete</Typography.Text>
        </Menu.Item>
      </Menu>
    );
  };

  return (
    <div className="jdn__locatorsList">
      <PageObjListHeader />
      <div className="jdn__locatorsList-content jdn__pageObj-content">
        {size(pageObjects) ? (
          <Collapse
            expandIcon={({ isActive }) => (
              <Icon component={CaretDownSvg} rotate={isActive ? 180 : 270} fill="#808080" />
            )}
            expandIconPosition="left"
            activeKey={activePanel}
            onChange={setActivePanel}
          >
            {pageObjects.map(({ id, name, url, locators }) => (
              <Collapse.Panel
                key={id}
                header={
                  <React.Fragment>
                    <Icon component={PageSvg} className="jdn__locatorsList-status" />
                    {name}
                  </React.Fragment>
                }
                extra={
                  <a onClick={(e) => e.stopPropagation()}>
                    <Dropdown trigger="click" overlay={renderMenu(id, locators)} data-testid="dropdown-button">
                      <Icon component={EllipsisSvg} />
                    </Dropdown>
                  </a>
                }
              >
                {renderContent(id, url)}
              </Collapse.Panel>
            ))}
          </Collapse>
        ) : (
          <PageObjectPlaceholder />
        )}
      </div>
    </div>
  );
};
