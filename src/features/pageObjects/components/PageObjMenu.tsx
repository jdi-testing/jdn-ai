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
import { AppDispatch } from '../../../app/store/store';
import { useOnboardingContext } from '../../onboarding/OnboardingProvider';
import { selectIsOnboardingOpen } from '../../onboarding/store/onboarding.selectors';
import { selectIsPageObjectsListUIEnabled } from '../selectors/pageObjectsListUI.selectors';

interface Props {
  pageObject: PageObject;
  elements: ILocator[];
}

export const PageObjMenu: React.FC<Props> = ({ pageObject, elements }) => {
  const dispatch = useDispatch<AppDispatch>();
  const { id, locators, name } = pageObject;

  const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

  const isOnboardingOpen = useSelector(selectIsOnboardingOpen);

  const getMenuItems = (pageObject: PageObject, locatorIds: ElementId[] | undefined, locatorObjects: ILocator[]) => {
    const handleRename = () => setIsRenameModalOpen(true);

    const handleRemove = () => {
      dispatch(removePageObject(id));
      dispatch(removeLocators(locatorIds));
    };

    const handleDownload = async () => {
      await generatePageObject(locatorObjects, pageObject).then(() =>
        dispatch(pushNotification({ action: { type: 'downloadFile' } })),
      );
    };

    const handleDownloadPerfTest = async () => {
      await generatePageObjectPerfTest(locatorObjects, pageObject).then(() =>
        dispatch(pushNotification({ action: { type: 'downloadJSFile' } })),
      );
    };

    const handleEdit = async () => {
      dispatch(setCurrentPageObj(id));
      await dispatch(checkLocatorsValidity()); // create thunk
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

  const isPageObjectsListUIEnabled = useSelector(selectIsPageObjectsListUIEnabled);

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <OnboardingTooltip>
        <Dropdown
          disabled={isOnboardingOpen}
          align={{ offset: [2, 0] }}
          trigger={['click']}
          menu={getMenuItems(pageObject, locators, elements)}
          getPopupContainer={(triggerNode) => triggerNode}
          destroyPopupOnHide
          arrow
        >
          <Button
            disabled={isOnboardingOpen || !isPageObjectsListUIEnabled}
            ref={menuRef}
            className="jdn__itemsList-button jdn__pageObject_button-menu"
            data-testid="dropdown-button"
            icon={<DotsThree size={18} />}
          />
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
