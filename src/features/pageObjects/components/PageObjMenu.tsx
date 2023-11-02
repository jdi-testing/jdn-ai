import React, { useEffect, useRef, useState } from 'react';
import { Button, Dropdown } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { size } from 'lodash';
import { DotsThree } from '@phosphor-icons/react';
import { pushNotification } from '../../../app/main.slice';
import {
  deleteOption,
  download,
  downloadPerfTest,
  edit,
  renameOption,
  dividerItem,
} from '../../../common/components/menu/menuOptions';
import { ElementId, ILocator } from '../../locators/types/locator.types';
import { removeLocators } from '../../locators/locators.slice';
import { removePageObject, setCurrentPageObj } from '../pageObject.slice';
import { PageObject } from '../types/pageObjectSlice.types';
import { generatePageObject, generatePageObjectPerfTest } from '../../pageObjects/utils/pageObject';
import { RenamePageObjectDialog } from './RenamePageObjDialog';
import { checkLocatorsValidity } from '../../locators/reducers/checkLocatorValidity.thunk';
import { OnboardingStep } from '../../onboarding/constants';
import { OnboardingTooltip } from '../../onboarding/components/OnboardingTooltip';
import { AppDispatch, RootState } from '../../../app/store/store';
import { useOnboardingContext } from '../../onboarding/OnboardingProvider';

interface Props {
  pageObject: PageObject;
  elements: ILocator[];
}

export const PageObjMenu: React.FC<Props> = ({ pageObject, elements }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { id, locators, name } = pageObject;

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const isOnboardingOpen = useSelector((state: RootState) => state.onboarding.isOnboardingOpen);

  const getMenuItems = (pageObject: PageObject, locatorIds: ElementId[] | undefined, locatorObjects: ILocator[]) => {
    const handleRename = () => setIsRenameModalOpen(true);

    const handleRemove = () => {
      dispatch(removePageObject(id));
      dispatch(removeLocators(locatorIds));
    };

    const handleDownload = () => {
      generatePageObject(locatorObjects, pageObject).then(() =>
        dispatch(pushNotification({ action: { type: 'downloadFile' } })),
      );
    };

    const handleDownloadPerfTest = () => {
      generatePageObjectPerfTest(locatorObjects, pageObject).then(() =>
        dispatch(pushNotification({ action: { type: 'downloadJSFile' } })),
      );
    };

    const handleEdit = () => {
      dispatch(setCurrentPageObj(id));
      dispatch(checkLocatorsValidity()); // create thunk
    };

    const items = [
      renameOption(handleRename),
      ...(size(locatorIds) ? [edit(handleEdit, 'Edit Page Object')] : []),
      ...(size(locatorIds) ? [download(handleDownload)] : []),
      ...(size(locatorIds) && __DEV_ENVIRONMENT__ ? [downloadPerfTest(handleDownloadPerfTest)] : []),
      dividerItem('11-1'),
      deleteOption(handleRemove),
    ];

    return { ...{ items } };
  };

  const menuRef = useRef<HTMLElement | null>(null);
  const { updateStepRefs } = useOnboardingContext();
  useEffect(() => {
    if (menuRef.current) {
      updateStepRefs(OnboardingStep.EditPO, menuRef);
    }
  }, []);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <OnboardingTooltip>
        <Dropdown
          disabled={isOnboardingOpen}
          align={{ offset: [15, 0] }}
          trigger={['click']}
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
      </OnboardingTooltip>
      <RenamePageObjectDialog
        isModalOpen={isRenameModalOpen}
        setIsModalOpen={setIsRenameModalOpen}
        pageObjId={id}
        {...{ name }}
      />
    </div>
  );
};
