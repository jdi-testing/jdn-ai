import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import { Dropdown, Menu, Typography } from "antd";

import EllipsisSvg from "../../../assets/ellipsis.svg";
import TrashBinSvg from "../../../assets/trash-bin.svg";
import DownloadSvg from "../../../assets/download.svg";
import PencilSvg from "../../../assets/pencil.svg";
import EditTextSvg from "../../../assets/edit-text.svg";
import { removePageObject, setCurrentPageObj } from "../../../store/slices/pageObjectSlice";
import { removeLocators } from "../../../store/slices/locatorsSlice";
import { generatePageObject } from "../utils/pageObject";
import { pageType } from "../../../utils/constants";
import { changePage } from "../../../store/slices/mainSlice";
import { size } from "lodash";

export const PageObjMenu = ({ id, name, locators, elements, library }) => {
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible] = useState(new Map());

  const currentPageObject = useSelector((_state) => _state.pageObject.currentPageObject);

  const handleMenuClick = (e, id) => {
    e.stopPropagation();
    setMenuVisible(new Map(menuVisible.set(id, true)));
  };

  const handleRename = (id, name) => {
    chrome.storage.sync.set({ OPEN_EDIT_NAME: { isOpen: true, value: { id, name } } });
  };

  const renderMenu = (id, locatorIds, locatorObjects, name) => {
    const handleRemove = () => {
      dispatch(removePageObject(id));
      dispatch(removeLocators(locatorIds));
    };

    const handleDownload = () => {
      generatePageObject(locatorObjects, name, library);
    };

    const handleEdit = () => {
      dispatch(setCurrentPageObj(id));
      dispatch(changePage({ page: pageType.locatorsList, pageObj: currentPageObject, alreadyGenerated: true }));
    };

    return (
      <Menu>
        <Menu.Item key="3" icon={<EditTextSvg />} onClick={() => handleRename(id, name)}>
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
    <a
      onClick={(e) => handleMenuClick(e, id)}
      onMouseLeave={() => setMenuVisible(new Map(menuVisible.set(id, false)))}
      data-testid="dropdown-button"
    >
      <Dropdown visible={menuVisible.get(id)} overlay={renderMenu(id, locators, elements, name)}>
        <Icon component={EllipsisSvg} />
      </Dropdown>
    </a>
  );
};
