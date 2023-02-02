import Icon from "@ant-design/icons";
import { Collapse, Typography } from "antd";
import { size } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { CaretDown } from "phosphor-react";
import PageSvg from "../assets/page.svg";
import { Footnote } from "../../../common/components/footnote/Footnote";
import { selectConfirmedLocators, selectPageObjects } from "../pageObject.selectors";
import { GenerationButton } from "./GenerationButton";
import { PageObjectPlaceholder } from "./PageObjectPlaceholder";
import { PageObjCopyButton } from "./PageObjCopyButton";
import { Locator } from "../../locators/Locator";
import { PageObjMenu } from "./PageObjMenu";
import { PageObjListHeader } from "./PageObjListHeader";
import { Notifications } from "../../../common/components/notification/Notifications";

export const PageObjList = (props) => {
  const state = useSelector((state) => state);
  const currentPageObject = useSelector((state) => state.pageObject.present.currentPageObject);
  const pageObjects = useSelector(selectPageObjects);
  const [activePanel, setActivePanel] = useState([currentPageObject]);

  const isExpanded = !!size(activePanel);

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

  const renderPageObjSettings = (pageObjId, url, library) => {
    return (
      <div className="jdn__pageObject__settings">
        <Footnote className="jdn__pageObject__settings-url">{url}</Footnote>
        <GenerationButton pageObj={pageObjId} {...{ library }} />
      </div>
    );
  };

  const renderContent = (pageObjId, url, elements, library) => {
    if (size(elements)) {
      return renderLocators(elements);
    } else {
      return renderPageObjSettings(pageObjId, url, library);
    }
  };

  const toggleExpand = () => {
    if (size(activePanel)) {
      setActivePanel([]);
    } else {
      const keys = pageObjects.map((po) => po.id);
      setActivePanel(keys);
    }
  };

  return (
    <div className="jdn__locatorsList">
      <PageObjListHeader {...{ ...props, toggleExpand, isExpanded, setActivePanel }} />
      <div className="jdn__locatorsList-content jdn__pageObj-content">
        {size(pageObjects) ? (
          <React.Fragment>
            <Collapse
              expandIcon={({ isActive }) => (
                <CaretDown
                  style={{
                    transform: isActive ? "rotate(180deg)" : "rotate(0deg)",
                  }}
                  size={14}
                  color="#878A9C"
                />
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
                        <Typography.Text className="jdn__pageObject-content-text">{name}</Typography.Text>
                      </React.Fragment>
                    }
                    extra={
                      <>
                        {isPageObjectNotEmpty && <PageObjCopyButton {...{ elements }} />}
                        <PageObjMenu {...{ id, name, locators, elements, library }} />
                      </>
                    }
                  >
                    {renderContent(id, url, elements, library)}
                  </Collapse.Panel>
                );
              })}
            </Collapse>
          </React.Fragment>
        ) : (
          <PageObjectPlaceholder />
        )}
        <Notifications />
      </div>
    </div>
  );
};
