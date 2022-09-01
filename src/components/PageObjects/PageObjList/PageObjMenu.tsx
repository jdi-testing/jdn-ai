import React, { MouseEvent, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import { Dropdown, Typography } from "antd";

import EllipsisSvg from "../../../assets/ellipsis.svg";
import TrashBinSvg from "../../../assets/trash-bin.svg";
import DownloadSvg from "../../../assets/download.svg";
import PencilSvg from "../../../assets/pencil.svg";
import EditTextSvg from "../../../assets/edit-text.svg";
import {
  removePageObject,
  setCurrentPageObj,
} from "../../../store/slices/pageObjectSlice";
import { removeLocators } from "../../../store/slices/locatorsSlice";
import { generatePageObject } from "../utils/pageObject";
import { pageType } from "../../../utils/constants";
import { changePage } from "../../../store/slices/mainSlice";
import { size } from "lodash";
import { Menu, MenuItem } from "../../common/Menu";
import { ElementId, Locator } from "../../../store/slices/locatorSlice.types";
import { ElementLibrary } from "../utils/generationClassesMap";
import { RootState } from "../../../store/store";
import { PageObjectId } from "../../../store/slices/pageObjectSlice.types";

interface Props {
  id: ElementId;
  name: string;
  locators: ElementId[];
  elements: Locator[];
  library: ElementLibrary;
}

export const PageObjMenu: React.FC<Props> = ({
  id,
  name,
  locators,
  elements,
  library,
}) => {
  const dispatch = useDispatch();
  const [menuVisible, setMenuVisible] = useState(new Map());

  const currentPageObject = useSelector(
    (_state: RootState) => _state.pageObject.currentPageObject
  );

  const handleMenuClick = (
    e: MouseEvent,
    id: PageObjectId
  ) => {
    e.stopPropagation();
    setMenuVisible(new Map(menuVisible.set(id, true)));
  };

  const renderMenu = (
    id: PageObjectId,
    locatorIds: ElementId[],
    locatorObjects: Locator[],
    name: string
  ) => {
    const handleRename = () => {
      chrome.storage.sync.set({ OPEN_EDIT_NAME: { isOpen: true, value: { id, name } } });
    };

    const handleRemove = () => {
      dispatch(removePageObject(id));
      dispatch(removeLocators(locatorIds));
    };

    const handleDownload = () => {
      generatePageObject(locatorObjects, name, library);
    };

    const handleEdit = () => {
      dispatch(setCurrentPageObj(id));
      dispatch(
        changePage({
          page: pageType.locatorsList,
          pageObj: currentPageObject,
          alreadyGenerated: true,
        })
      );
    };

    const items: MenuItem[] = [
      {
        key: "0",
        icon: <EditTextSvg />,
        onClick: handleRename,
        label: "Rename",
      },
    ];

    if (size(locatorIds)) {
      items.push({
        key: "1",
        icon: <PencilSvg />,
        onClick: handleEdit,
        label: "Edit list",
      });

      items.push({
        key: "2",
        icon: <DownloadSvg />,
        onClick: handleDownload,
        label: "Download",
      });
    }

    items.push({
      key: "3",
      icon: <TrashBinSvg />,
      onClick: handleRemove,
      label: <Typography.Text type="danger">Delete</Typography.Text>,
    });

    return <Menu {...{ items }} />;
  };

  return (
    <a
      onClick={(e) => handleMenuClick(e, id)}
      onMouseLeave={() => setMenuVisible(new Map(menuVisible.set(id, false)))}
      data-testid="dropdown-button"
    >
      <Dropdown
        visible={menuVisible.get(id)}
        overlay={renderMenu(id, locators, elements, name)}
      >
        <Icon component={EllipsisSvg} />
      </Dropdown>
    </a>
  );
};
