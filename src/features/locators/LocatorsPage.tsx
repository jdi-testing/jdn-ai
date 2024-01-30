import React, { useState, useRef, useEffect } from 'react';
import { Button, Modal, Tooltip, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';

import { isEmpty, isEqual, size } from 'lodash';

import { changePageBack, setScriptMessage } from '../../app/main.slice';
import { Breadcrumbs } from '../../common/components/breadcrumbs/Breadcrumbs';
import { customConfirm } from '../../common/components/CustomConfirm';
import { clearLocators } from '../pageObjects/pageObject.slice';
import { locatorGenerationController } from './utils/locatorGenerationController';
import { removeLocators, restoreLocators } from './locators.slice';
import { LocatorsTree, LocatorTreeProps } from './components/LocatorsTree';
import { LocatorListHeader } from './components/LocatorListHeader';
import { Filter } from '../filter/Filter';
import { useCalculateHeaderSize } from './utils/useCalculateHeaderSize';
import { RootState } from '../../app/store/store';
import { IdentificationStatus } from './types/locator.types';
import { LocatorTreeSpinner } from './components/LocatorTreeSpinner';
import { removeAll as removeAllFilters, setFilter } from '../filter/filter.slice';
import { selectIfUnselectedAll, selectClassFilterByPO } from '../filter/filter.selectors';

import {
  getLocatorsIdsByPO,
  selectLocatorsByPageObject,
  selectPresentLocatorsByPO,
} from './selectors/locatorsByPO.selectors';
import {
  selectFilteredLocators,
  selectInProgressGenerateByPageObj,
  selectCheckedLocatorsByPageObject,
  selectInProgressGenerateHashes,
  selectInProgressHashes,
  selectCalculatedAndCheckedByPageObj,
  selectDeletedCheckedByPageObj,
  selectGenerateByPageObject,
} from './selectors/locatorsFiltered.selectors';
import { useNotifications } from '../../common/components/notification/useNotifications';
import { selectCurrentPageObject } from '../pageObjects/selectors/pageObjects.selectors';
import { EmptyListModal } from './text.constants';
import { LocatorsEmptyListInfo } from './components/LocatorsEmptyListInfo';
import { useOnboardingContext } from '../onboarding/OnboardingProvider';
import { OnboardingStep } from '../onboarding/constants';
import { useOnboarding } from '../onboarding/useOnboarding';
import { setIsCustomLocatorFlow } from '../onboarding/store/onboarding.slice';
import { selectIsEditModalOpen } from './selectors/customLocator.selectors';
import { setIsEditModalOpen } from './customLocator.slice';
import { selectIsCustomLocatorFlow } from '../onboarding/store/onboarding.selectors';
import { stopProgressBar } from '../pageObjects/progressBar.slice';
import { enablePageObjectsListUI } from '../pageObjects/pageObjectsListUI.slice';

const { confirm } = Modal;

export const LocatorsPage = () => {
  const dispatch = useDispatch();
  const showSpinner = useSelector(
    (state: RootState) => state.locators.present.status === IdentificationStatus.preparing,
  );
  const locators = useSelector(selectFilteredLocators);
  const areUnselectedAll = useSelector(selectIfUnselectedAll);
  const locatorIds = useSelector(getLocatorsIdsByPO);
  const inProgressGenerate = useSelector(selectInProgressGenerateByPageObj);
  const inProgressGenerateHashes = useSelector(selectInProgressGenerateHashes);
  const inProgressHashes = useSelector(selectInProgressHashes);
  const calculatedAndChecked = useSelector(selectCalculatedAndCheckedByPageObj);
  const deletedChecked = useSelector(selectDeletedCheckedByPageObj);
  const currentPO = useSelector(selectCurrentPageObject);

  const breadcrumbsRef = useRef(null);

  const [locatorsSnapshot] = useState(useSelector(selectLocatorsByPageObject));
  const [filterSnapshot] = useState(useSelector(selectClassFilterByPO));
  const [isEmptyListModalOpen, setIsEmptyListModalOpen] = useState(!!locators.length);
  const isEditModalOpen = useSelector(selectIsEditModalOpen);

  // For changing locatorsList-content height depends on header height
  const containerHeight = useCalculateHeaderSize(breadcrumbsRef);
  const containerRef = useRef(null);
  useNotifications(containerRef?.current);

  const isNoPageLocators = isEmpty(useSelector(selectPresentLocatorsByPO));

  const { handleOnChangeStep, isOnboardingOpen } = useOnboarding();

  const handleSetIsEditModalOpen = (payload: boolean) => dispatch(setIsEditModalOpen(payload));

  const locatorsGenerated = useSelector(
    (state: RootState) =>
      state.locators.present.status === IdentificationStatus.noStatus ||
      state.locators.present.status === IdentificationStatus.noElements,
  );
  useEffect(() => {
    if (isNoPageLocators && locatorsGenerated) {
      dispatch(setIsCustomLocatorFlow(true));
    }
    // The timer is needed so that the step closes automatically, but the animation is not too fast
    const timeoutId = setTimeout(() => {
      handleOnChangeStep(OnboardingStep.CustomLocator);
    }, 300);

    return () => {
      clearTimeout(timeoutId);
    };
  }, []);

  // ToDo cb naming - ???
  const pageBack = () => {
    dispatch(setScriptMessage({}));
    dispatch(changePageBack());
  };

  const isCustomLocatorFlow = useSelector(selectIsCustomLocatorFlow);

  const handleConfirm = () => {
    if (isOnboardingOpen) {
      const DownloadPOStepNumberInDefaultOnboardingMode = 8;
      const DownloadPOStepNumberInCustomLocatorOnboardingMode = 9;
      pageBack();
      if (isCustomLocatorFlow) {
        handleOnChangeStep(DownloadPOStepNumberInCustomLocatorOnboardingMode);
      } else handleOnChangeStep(DownloadPOStepNumberInDefaultOnboardingMode);
    }
    if (inProgressGenerate.length) {
      confirm({
        title: 'Confirm this locators list',
        content: `Not all of the selected locators have already been generated, we recommend waiting until the generation is complete.`,
        okText: 'Confirm',
        cancelText: 'Cancel',
        onOk: () => {
          locatorGenerationController.revokeTasks(inProgressGenerateHashes);
          pageBack();
        },
      });
    } else if (deletedChecked.length) {
      confirm({
        title: 'Confirm the selection',
        content: `Not all selected locators will be generated.
        You can cancel the generation and restore the required locators first.`,
        okText: 'Confirm',
        onOk: () => pageBack(),
      });
    } else pageBack();
  };

  const handleOk = () => {
    pageBack();
  };

  const handleDiscard = () => {
    locatorGenerationController.revokeTasks(inProgressHashes);
    if (!size(locatorsSnapshot)) {
      dispatch(removeLocators(locatorIds));
      dispatch(clearLocators(undefined));
      dispatch(removeAllFilters());
    } else {
      dispatch(restoreLocators(locatorsSnapshot));
      if (currentPO) dispatch(setFilter({ pageObjectId: currentPO.id, JDIclassFilter: filterSnapshot }));
    }
    pageBack();
  };

  const backButtonHandler = () => {
    if (!locators.length && !locatorsSnapshot.length) handleDiscard();
    if (isEqual(locators, locatorsSnapshot)) pageBack();
    else {
      const isOkButtonEnabled = !!(inProgressGenerate.length || calculatedAndChecked.length);

      customConfirm({
        onAlt: handleDiscard,
        altText: 'Discard',
        onOk: handleOk,
        isOkButtonEnabled,
        confirmTitle: 'Save this locators list?',
        confirmContent: 'The list has been edited and the changes have not been accepted. Do you want to save changes?',
      });
    }
  };

  const renderBackButton = () => {
    return (
      <Button onClick={backButtonHandler} className="jdn__buttons">
        Back
      </Button>
    );
  };

  const renderConfirmButton = () => {
    const saveLocatorsRef = useRef<HTMLElement | null>(null);
    const { updateStepRefs } = useOnboardingContext();
    useEffect(() => {
      // if LocatorsPage rendered => stopProgressBar & enablePageObjectsListUI:
      dispatch(stopProgressBar());
      dispatch(enablePageObjectsListUI());

      if (saveLocatorsRef.current) {
        updateStepRefs(OnboardingStep.SaveLocators, saveLocatorsRef, pageBack);
      }
    }, []);

    const checkedLocators = useSelector(selectCheckedLocatorsByPageObject);
    const generatedLocators = useSelector(selectGenerateByPageObject);
    const isDisabled = !inProgressGenerate.length && !calculatedAndChecked.length;

    const saveButtonLabel =
      (checkedLocators.length || generatedLocators.length) === 1
        ? 'Save 1 locator'
        : checkedLocators.length || generatedLocators.length
        ? `Save ${checkedLocators.length} locators`
        : 'Save';

    return (
      <Tooltip
        overlayClassName="jdn__button-tooltip"
        title={isDisabled ? 'Please select locators for your current page object.' : ''}
      >
        <div ref={saveLocatorsRef as React.LegacyRef<HTMLDivElement>}>
          <Button type="primary" onClick={handleConfirm} className="jdn__buttons" disabled={isDisabled}>
            {saveButtonLabel}
          </Button>
        </div>
      </Tooltip>
    );
  };

  return (
    <>
      <div className="jdn__locator-list">
        <Row justify="space-between" wrap={false}>
          <Breadcrumbs ref={breadcrumbsRef} />
          <Filter />
        </Row>
        <LocatorListHeader
          isEditModalOpen={isEditModalOpen}
          setIsEditModalOpen={handleSetIsEditModalOpen}
          render={(viewProps: LocatorTreeProps['viewProps']) => (
            <div
              ref={containerRef}
              className="jdn__locator-list-content jdn__itemsList-content"
              style={{ height: containerHeight }}
            >
              {locators.length || areUnselectedAll ? (
                <LocatorsTree {...{ viewProps, locatorIds }} />
              ) : showSpinner ? (
                <LocatorTreeSpinner />
              ) : (
                <>
                  {isNoPageLocators && (
                    <Modal
                      title={EmptyListModal.Title}
                      open={isEmptyListModalOpen}
                      onCancel={() => setIsEmptyListModalOpen(false)}
                      onOk={pageBack}
                      okText={EmptyListModal.OkButtonTitle}
                    >
                      {EmptyListModal.Contents}
                    </Modal>
                  )}
                  <LocatorsEmptyListInfo
                    isNoPageLocators={isNoPageLocators}
                    setIsEditModalOpen={handleSetIsEditModalOpen}
                  ></LocatorsEmptyListInfo>
                </>
              )}
            </div>
          )}
        />
      </div>
      <div className="jdn__navigation">
        {renderBackButton()}
        {renderConfirmButton()}
      </div>
    </>
  );
};
