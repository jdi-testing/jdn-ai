import { Button, Dropdown } from "antd";
import React, { useContext, useState } from "react";
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
  dividerItem,
} from "../../../common/components/menu/menuOptions";
import { ElementId, Locator } from "../../locators/types/locator.types";
import { removeLocators } from "../../locators/locators.slice";
import { removePageObject, setCurrentPageObj } from "../pageObject.slice";
import { PageObject } from "../types/pageObjectSlice.types";
import { generatePageObject, generatePageObjectPerfTest } from "../../pageObjects/utils/pageObject";
import { RenamePageObjectDialog } from "./RenamePageObjDialog";
import { checkLocatorsValidity } from "../../locators/reducers/checkLocatorValidity.thunk";
import { useOnBoardingRef } from "../../onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../onboarding/types/constants";
import { OnbrdTooltip } from "../../onboarding/components/OnbrdTooltip";
import { OnboardingContext } from "../../onboarding/OnboardingProvider";
import { AppDispatch } from '../../../app/store/store';

interface Props {
  pageObject: PageObject;
  elements: Locator[];
}

export const PageObjMenu: React.FC<Props> = ({ pageObject, elements }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { id, locators, name } = pageObject;

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const { isOpen: isOnboardingOpen } = useContext(OnboardingContext);

  const getMenuItems = (pageObject: PageObject, locatorIds: ElementId[] | undefined, locatorObjects: Locator[]) => {
    const handleRename = () => setIsRenameModalOpen(true);

    const handleRemove = () => {
      dispatch(removePageObject(id));
      dispatch(removeLocators(locatorIds));
    };

    const handleDownload = () => {
      generatePageObject(locatorObjects, pageObject).then(() =>
        dispatch(pushNotification({ action: { type: "downloadFile" } }))
      );
    };

    const handleDownloadPerfTest = () => {
      generatePageObjectPerfTest(locatorObjects, pageObject).then(() =>
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
      dividerItem("11-1"),
      deleteOption(handleRemove),
    ];

    return { ...{ items } };
  };

  const menuRef = useOnBoardingRef(OnbrdStep.EditPO);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <OnbrdTooltip>
        <Dropdown
          disabled={isOnboardingOpen}
          align={{ offset: [15, 0] }}
          trigger={["click"]}
          menu={getMenuItems(pageObject, locators, elements)}
          getPopupContainer={(triggerNode) => triggerNode}
          destroyPopupOnHide
        >
          <Button
            disabled={isOnboardingOpen}
            ref={menuRef}
            className="jdn__itemsList-button jdn__pageObject_button-menu"
            data-testid="dropdown-button"
            icon={<DotsThree size={18} />}
          ></Button>
        </Dropdown>
      </OnbrdTooltip>
      <RenamePageObjectDialog
        isModalOpen={isRenameModalOpen}
        setIsModalOpen={setIsRenameModalOpen}
        pageObjId={id}
        {...{ name }}
      />
    </div>
  );
};
