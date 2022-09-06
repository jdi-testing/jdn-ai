import React from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import { Dropdown } from "antd";

import EllipsisSvg from "../../../assets/ellipsis.svg";
import { removePageObject, setCurrentPageObj } from "../../../store/slices/pageObjectSlice";
import { removeLocators } from "../../../store/slices/locatorsSlice";
import { generatePageObject } from "../utils/pageObject";
import { pageType } from "../../../utils/constants";
import { changePage } from "../../../store/slices/mainSlice";
import { size } from "lodash";
import { Menu } from "../../common/Menu";
import { ElementId, Locator } from "../../../store/slices/locatorSlice.types";
import { ElementLibrary } from "../utils/generationClassesMap";
import { RootState } from "../../../store/store";
import { PageObjectId } from "../../../store/slices/pageObjectSlice.types";
import { deleteOption, download, edit, renameOption } from "../../Locators/menuOptions";

interface Props {
  id: ElementId;
  name: string;
  locators: ElementId[];
  elements: Locator[];
  library: ElementLibrary;
}

export const PageObjMenu: React.FC<Props> = ({ id, name, locators, elements, library }) => {
  const dispatch = useDispatch();

  const currentPageObject = useSelector((_state: RootState) => _state.pageObject.currentPageObject);

  const renderMenu = (id: PageObjectId, locatorIds: ElementId[], locatorObjects: Locator[], name: string) => {
    const handleRename = () => {
      chrome.storage.sync.set({
        OPEN_EDIT_NAME: { isOpen: true, value: { id, name } },
      });
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

    const items = [
      renameOption(handleRename),
      ...(size(locatorIds) ? [edit(handleEdit, "Edit list")] : []),
      ...(size(locatorIds) ? [download(handleDownload)] : []),
      deleteOption(handleRemove),
    ];

    return <Menu {...{ items }} />;
  };

  return (
    <a onClick={(e) => e.stopPropagation()} data-testid="dropdown-button">
      <Dropdown
        arrow={{ pointAtCenter: true }}
        align={{ offset: [14, 0] }}
        trigger={["click"]}
        overlay={renderMenu(id, locators, elements, name)}
        getPopupContainer={(triggerNode) => triggerNode}
        destroyPopupOnHide
      >
        <Icon component={EllipsisSvg} />
      </Dropdown>
    </a>
  );
};
