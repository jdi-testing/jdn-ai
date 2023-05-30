import { Button, Dropdown } from "antd";
import React, { useState } from "react";
import { useDispatch } from "react-redux";

import { size } from "lodash";
import { DotsThree } from "phosphor-react";
import { pushNotification } from "../../../app/main.slice";
import {
  deleteOption,
  download,
  downloadPerfTest,
  edit,
  renameOption,
} from "../../../common/components/menu/menuOptions";
import { ElementId, Locator } from "../../locators/types/locator.types";
import { removeLocators } from "../../locators/locators.slice";
import { removePageObject, setCurrentPageObj } from "../pageObject.slice";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";
import { generatePageObject, generatePageObjectPerfTest } from "../../pageObjects/utils/pageObject";
import { RenamePageObjectDialog } from "./RenamePageObjDialog";
import { checkLocatorsValidity } from "../../locators/reducers/checkLocatorValidity.thunk";

interface Props {
  id: PageObjectId;
  name: string;
  url: string;
  locators?: ElementId[];
  elements: Locator[];
  library: ElementLibrary;
}

export const PageObjMenu: React.FC<Props> = ({ id, name, url, locators, elements, library }) => {
  const dispatch = useDispatch();

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const renderMenu = (
    id: PageObjectId,
    locatorIds: ElementId[] | undefined,
    locatorObjects: Locator[],
    name: string,
    url: string
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

    const handleDownloadPerfTest = () => {
      generatePageObjectPerfTest(locatorObjects, name, url).then(() =>
        dispatch(pushNotification({ action: { type: "downloadJSFile" } }))
      );
    };

    const handleEdit = () => {
      dispatch(setCurrentPageObj(id));
      dispatch(checkLocatorsValidity()); // create thunk
    };

    const items = [
      renameOption(handleRename),
      ...(size(locatorIds) ? [edit(handleEdit, "Edit Page Object")] : []),
      ...(size(locatorIds) ? [download(handleDownload)] : []),
      ...(size(locatorIds) && __DEV_ENVIRONMENT__ ? [downloadPerfTest(handleDownloadPerfTest)] : []),
      deleteOption(handleRemove),
    ];

    return { ...{ items } };
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        align={{ offset: [15, 0] }}
        trigger={["click"]}
        menu={renderMenu(id, locators, elements, name, url)}
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
