import { Collapse, Tooltip, Typography } from "antd";
import { isNil, size } from "lodash";
import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";

import { CaretDown } from "phosphor-react";
import { Footnote } from "../../../common/components/footnote/Footnote";
import { selectConfirmedLocators, selectPageObjects } from "../pageObject.selectors";
import { GenerationButton } from "./GenerationButton";
import { PageObjectPlaceholder } from "./PageObjectPlaceholder";
import { PageObjCopyButton } from "./PageObjCopyButton";
import { Locator } from "../../locators/Locator";
import { PageObjMenu } from "./PageObjMenu";
import { PageObjListHeader } from "./PageObjListHeader";
import { Notifications } from "../../../common/components/notification/Notifications";
import { PageObjectIcon } from "./PageObjectIcon";
import { RootState } from "../../../app/store/store";
import { Locator as LocatorType } from "../../locators/types/locator.types";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { PageType } from "../../../app/types/mainSlice.types";

interface Props {
  template?: Blob;
}

export const PageObjList: React.FC<Props> = (props) => {
  const state = useSelector((state) => state);
  const currentPageObject = useSelector((state: RootState) => state.pageObject.present.currentPageObject);
  const pageObjects = useSelector(selectPageObjects);
  const [activePanel, setActivePanel] = useState([currentPageObject]);

  const isExpanded = !!size(activePanel);

  useEffect(() => {
    setActivePanel([currentPageObject]);
  }, [currentPageObject]);

  const renderLocators = (elements: LocatorType[], library: ElementLibrary) => {
    if (size(elements)) {
      return elements.map((element) => (
        <Locator {...{ element, library }} key={element.element_id} currentPage={PageType.PageObject} />
      ));
    } else {
      return "No locators selected";
    }
  };

  const renderPageObjGeneration = (pageObjId: PageObjectId, url: string, library: ElementLibrary) => {
    return (
      <div className="jdn__pageObject__settings">
        <Footnote className="jdn__pageObject__settings-url">{url}</Footnote>
        <GenerationButton pageObj={pageObjId} {...{ library }} />
      </div>
    );
  };

  const renderContent = (pageObjId: PageObjectId, url: string, elements: LocatorType[], library: ElementLibrary) => {
    if (size(elements)) {
      return renderLocators(elements, library);
    } else {
      return renderPageObjGeneration(pageObjId, url, library);
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
      <div className="jdn__locatorsList-content jdn__pageObject-content">
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
              {...(!isNil(activePanel) ? { activeKey: activePanel } : {})}
              /* @ts-ignore */
              onChange={setActivePanel}
            >
              {pageObjects.map(({ id, name, url, locators, library, isBaseClass, extended }) => {
                const elements = selectConfirmedLocators(state as RootState, id);
                const isPageObjectNotEmpty = !!size(elements);
                return (
                  <Collapse.Panel
                    key={id}
                    header={
                      <Tooltip
                        title={url}
                        placement="bottomLeft"
                        getPopupContainer={(triggerNode) => triggerNode}
                        align={{ offset: [-28, 0] }}
                      >
                        <PageObjectIcon {...{ isBaseClass, extended }} />
                        <Typography.Text className="jdn__pageObject-content-text">{name}</Typography.Text>
                      </Tooltip>
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
