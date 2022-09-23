import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { Collapse } from "antd";
import { size } from "lodash";
import Icon from "@ant-design/icons";

import { PageObjListHeader } from "./PageObjListHeader";
import { PageObjMenu } from "./PageObjMenu";

import CaretDownSvg from "../../../assets/caret-down.svg";
import PageSvg from "../../../assets/page.svg";
import { selectConfirmedLocators, selectPageObjects } from "../../../store/selectors/pageObjectSelectors";
import { Locator } from "../../Locators/Locator";
import { GenerationButtons } from "./GenerationButtons";
import { PageObjectPlaceholder } from "../PageObjectPlaceholder";
import { PageObjCopyButton } from "./PageObjCopyButton";

export const PageObjList = (props) => {
  const state = useSelector((state) => state);
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);
  const pageObjects = useSelector(selectPageObjects);
  const [activePanel, setActivePanel] = useState([currentPageObject]);

  useEffect(() => {
    setActivePanel([currentPageObject]);
  }, [currentPageObject]);

  const renderLocators = (elements) => {
    if (size(elements)) {
      return elements.map((element) => <Locator key={element.element_id} {...{ element }} noScrolling={true} />);
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

  const renderContent = (pageObjId, url, elements) => {
    if (size(elements)) {
      return renderLocators(elements);
    } else {
      return renderPageObjSettings(pageObjId, url);
    }
  };

  return (
    <div className="jdn__locatorsList">
      <PageObjListHeader {...props} />
      <div className="jdn__locatorsList-content jdn__pageObj-content">
        {size(pageObjects) ? (
          <Collapse
            expandIcon={({ isActive }) => (
              <Icon component={CaretDownSvg} rotate={isActive ? 180 : 270} fill="#808080" />
            )}
            expandIconPosition="start"
            activeKey={activePanel}
            onChange={setActivePanel}
          >
            {pageObjects.map(({ id, name, url, locators, library }) => {
              const elements = selectConfirmedLocators(state, id);
              const isPageObjectNotEmpty = !!size(elements);
              return (
                <Collapse.Panel
                  key={id}
                  header={
                    <React.Fragment>
                      <Icon component={PageSvg} className="jdn__locatorsList-status" />
                      <span className="jdn__pageObject-content-text">{name}</span>
                    </React.Fragment>
                  }
                  extra={
                    <>
                      {isPageObjectNotEmpty && <PageObjCopyButton {...{ elements }} />}
                      <PageObjMenu {...{ id, name, locators, elements, library }} />
                    </>
                  }
                >
                  {renderContent(id, url, elements)}
                </Collapse.Panel>
              );
            })}
          </Collapse>
        ) : (
          <PageObjectPlaceholder />
        )}
      </div>
    </div>
  );
};
