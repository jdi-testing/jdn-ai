import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Dropdown } from "antd";

import { removePageObject, setCurrentPageObj } from "../../../store/slices/pageObjectSlice";
import { removeLocators } from "../../../store/slices/locatorsSlice";
import { generatePageObject } from "../utils/pageObject";
import { changePage } from "../../../store/slices/mainSlice";
import { size } from "lodash";
import { Menu } from "../../common/Menu";
import { ElementId, Locator } from "../../../store/slices/locatorSlice.types";
import { ElementLibrary } from "../utils/generationClassesMap";
import { RootState } from "../../../store/store";
import { PageObjectId } from "../../../store/slices/pageObjectSlice.types";
import { deleteOption, download, edit, renameOption } from "../../Locators/menuOptions";
import { PageType } from "../../../store/slices/mainSlice.types";
import { DotsThree } from "phosphor-react";
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
      generatePageObject(locatorObjects, name, library);
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
        >
        </Button>
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
