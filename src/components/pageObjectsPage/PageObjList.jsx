import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import { Collapse } from "antd";
import { size } from "lodash";

import { PageObjListHeader } from "./PageObjListHeader";

import CaretDownSvg from "../../assets/caret-down.svg";
import PageSvg from "../../assets/page.svg";
import { selectConfirmedLocators, selectPageObjects } from "../../store/selectors/pageObjectSelectors";
import { Locator } from "../locatorsPage/Locator";
import { GenerationButtons } from "../GenerationButtons";

export const PageObjList = () => {
  const state = useSelector((state) => state);
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);
  const pageObjects = useSelector(selectPageObjects);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const [activePanel, setActivePanel] = useState([]);

  useEffect(() => {
    setActivePanel([...activePanel, currentPageObject]);
  }, [currentPageObject]);

  const renderLocators = (pageObjId) => {
    const elements = selectConfirmedLocators(state, pageObjId);
    if (size(elements)) {
      return elements.map((element) => <Locator key={element.element_id} {...{ element, xpathConfig }} />);
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

  return (
    <div className="jdn__locatorsList">
      <PageObjListHeader />
      <div className="jdn__locatorsList-content jdn__pageObj-content">
        <Collapse
          className="jdn__collapse"
          expandIcon={({ isActive }) => <Icon component={CaretDownSvg} rotate={isActive ? 180 : 0} />}
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
              className="jdn__collapse-panel"
            >
              {size(locators) ? renderLocators(id) : renderPageObjSettings(id, url)}
            </Collapse.Panel>
          ))}
        </Collapse>
      </div>
    </div>
  );
};
