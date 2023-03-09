import { Button, Dropdown } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { size } from "lodash";
import { DotsThree } from "phosphor-react";
import { changePage, pushNotification } from "../../../app/main.slice";
import { PageType } from "../../../app/types/mainSlice.types";
import { RootState } from "../../../app/store/store";
import { deleteOption, download, edit, renameOption } from "../../../common/components/menu/menuOptions";
import { ElementId, Locator } from "../../locators/types/locator.types";
import { removeLocators } from "../../locators/locators.slice";
import { removePageObject, setCurrentPageObj } from "../pageObject.slice";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { generatePageObject } from "../../pageObjects/utils/pageObject";
import { RenamePageObjectDialog } from "./RenamePageObjDialog";

interface Props {
  id: ElementId;
  name: string;
  locators?: ElementId[];
  elements: Locator[];
  library: ElementLibrary;
}

export const PageObjMenu: React.FC<Props> = ({ id, name, locators, elements, library }) => {
  const dispatch = useDispatch();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const currentPageObject = useSelector((_state: RootState) => _state.pageObject.present.currentPageObject);

  const renderMenu = (
    id: PageObjectId,
    locatorIds: ElementId[] | undefined,
    locatorObjects: Locator[],
    name: string
  ) => {
    const handleRename = () => setIsRenameModalOpen(true);

    const handleRemove = () => {
      dispatch(removePageObject(id));
      dispatch(removeLocators(locatorIds));
    };

    const handleDownload = () => {
      generatePageObject(locatorObjects, name, library).then(() =>
        dispatch(pushNotification({ action: { type: "downloadFile" } }))
      );
    };

    const handleEdit = () => {
      dispatch(setCurrentPageObj(id));
      dispatch(
        changePage({
          page: PageType.LocatorsList,
          pageObj: currentPageObject,
          alreadyGenerated: true,
        })
      );
    };

    const items = [
      renameOption(handleRename),
      ...(size(locatorIds) ? [edit(handleEdit, "Edit Page Object")] : []),
      ...(size(locatorIds) ? [download(handleDownload)] : []),
      deleteOption(handleRemove),
    ];

    return { ...{ items } };
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        align={{ offset: [15, 0] }}
        trigger={["click"]}
        menu={renderMenu(id, locators, elements, name)}
        getPopupContainer={(triggerNode) => triggerNode}
        destroyPopupOnHide
      >
        <Button
          className="jdn__locatorsList_button jdn__pageObject_button-menu"
          data-testid="dropdown-button"
          icon={<DotsThree size={18} />}
        ></Button>
      </Dropdown>
      <RenamePageObjectDialog
        isModalOpen={isRenameModalOpen}
        setIsModalOpen={setIsRenameModalOpen}
        pageObjId={id}
        {...{ name }}
      />
    </div>
  );
};
