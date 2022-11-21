import { Button, Dropdown, Menu } from "antd";
import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { size } from "lodash";
import { DotsThree } from "phosphor-react";
import { changePage, pushNotification } from "../../../app/mainSlice";
import { PageType } from "../../../app/mainSlice.types";
import { RootState } from "../../../app/store";
import { deleteOption, download, edit, renameOption } from "../../../common/components/menu/menuOptions";
import { ElementId, Locator } from "../../locators/locatorSlice.types";
import { removeLocators } from "../../locators/locatorsSlice";
import { removePageObject, setCurrentPageObj } from "../pageObjectSlice";
import { PageObjectId } from "../pageObjectSlice.types";
import { ElementLibrary } from "../utils/generationClassesMap";
import { generatePageObject } from "../utils/pageObject";
import { RenamePageObjectDialog } from "./RenamePageObjDialog";

interface Props {
  id: ElementId;
  name: string;
  locators: ElementId[];
  elements: Locator[];
  library: ElementLibrary;
}

export const PageObjMenu: React.FC<Props> = ({ id, name, locators, elements, library }) => {
  const dispatch = useDispatch();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);
  const currentPageObject = useSelector((_state: RootState) => _state.pageObject.present.currentPageObject);

  const renderMenu = (id: PageObjectId, locatorIds: ElementId[], locatorObjects: Locator[], name: string) => {
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
      ...(size(locatorIds) ? [edit(handleEdit, "Edit list")] : []),
      ...(size(locatorIds) ? [download(handleDownload)] : []),
      deleteOption(handleRemove),
    ];

    return <Menu {...{ items }} />;
  };

  return (
    <React.Fragment>
      <Dropdown
        arrow={{ pointAtCenter: true }}
        align={{ offset: [10, 0] }}
        trigger={["click"]}
        overlay={renderMenu(id, locators, elements, name)}
        getPopupContainer={(triggerNode) => triggerNode}
        destroyPopupOnHide
      >
        <Button
          className="jdn__locatorsList_button jdn__locatorsList_button-menu"
          onClick={(e) => e.stopPropagation()}
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
    </React.Fragment>
  );
};
