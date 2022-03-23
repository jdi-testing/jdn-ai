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
import DownloadSvg from "../../assets/download.svg";
import PencilSvg from "../../assets/pencil.svg";
import { selectConfirmedLocators, selectPageObjects } from "../../store/selectors/pageObjectSelectors";
import { Locator } from "../Locators/Locator";
import { GenerationButtons } from "./GenerationButtons";
import { PageObjectPlaceholder } from "./PageObjectPlaceholder";
import { removePageObject } from "../../store/slices/pageObjectSlice";
import { removeLocators } from "../../store/slices/locatorsSlice";
import { generatePageObject } from "../../services/pageObject";
import { pageType } from "../../utils/constants";
import { changePage } from "../../store/slices/mainSlice";

export const PageObjList = () => {
  const state = useSelector((state) => state);
  const dispatch = useDispatch();
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);
  const pageObjects = useSelector(selectPageObjects);
  const [activePanel, setActivePanel] = useState([]);

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

  const handleRename = (id, name) => {
    chrome.storage.sync.set({ OPEN_EDIT_NAME: { isOpen: true, value: {id, name} } });
  };

  const renderMenu = (id, locatorIds, locatorObjects, name) => {
    const handleRemove = () => {
      dispatch(removePageObject(id));
      dispatch(removeLocators(locatorIds));
    };

    const handleDownload = () => {
      generatePageObject(locatorObjects, name);
    };

    const handleEdit = () => {
      dispatch(changePage({ page: pageType.locatorsList, pageObj: currentPageObject, alreadyGenerated: true }));
    };

    return (
      <Menu>
        <Menu.Item key="3" icon={<PencilSvg />} onClick={() => handleRename(id, name)}>
          Rename
        </Menu.Item>
        {size(locatorIds) ? (
          <React.Fragment>
            <Menu.Item key="4" icon={<PencilSvg />} onClick={handleEdit}>
              Edit list
            </Menu.Item>
            <Menu.Item key="5" icon={<DownloadSvg />} onClick={handleDownload}>
              Download
            </Menu.Item>
          </React.Fragment>
        ) : null}
        <Menu.Item key="6" icon={<TrashBinSvg />} onClick={handleRemove}>
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
            {pageObjects.map(({ id, name, url, locators }) => {
              const elements = selectConfirmedLocators(state, id);
              return (
                <Collapse.Panel
                  key={id}
                  header={
                    <React.Fragment>
                      <Icon component={PageSvg} className="jdn__locatorsList-status" />
                      {name}
                    </React.Fragment>
                  }
                  extra={
                    <a onClick={(e) => e.stopPropagation()} data-testid="dropdown-button">
                      <Dropdown trigger="click" overlay={renderMenu(id, locators, elements, name)}>
                        <Icon component={EllipsisSvg} />
                      </Dropdown>
                    </a>
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
