import React, { ReactNode, useEffect, useRef, useState } from 'react';
import { size } from 'lodash';
import { Button, Checkbox, Row } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { Chip } from '../../../common/components/Chip';
import { CaretDown, DotsThree } from '@phosphor-icons/react';
import { PlusOutlined } from '@ant-design/icons';
import { elementGroupUnsetActive, setElementGroupGeneration, toggleAllLocatorsIsChecked } from '../locators.slice';
import { newLocatorStub } from '../utils/constants';
import { LocatorsSearch } from './LocatorsSearch';
import { LocatorEditDialog } from './LocatorEditDialog';
import { OnboardingTooltip } from '../../onboarding/components/OnboardingTooltip';
import { LocatorMenu } from './LocatorMenu';
import { LocatorTreeProps, ExpandState } from './LocatorsTree';
import {
  selectActiveLocators,
  selectFilteredLocators,
  selectCheckedLocatorsByPageObject,
  selectActualActiveByPageObject,
  selectGenerateByPageObject,
} from '../selectors/locatorsFiltered.selectors';
import { useOnboardingContext } from '../../onboarding/OnboardingProvider';
import { OnboardingStep } from '../../onboarding/constants';
import { selectIsOnboardingOpen } from '../../onboarding/store/onboarding.selectors';
import { useOnboarding } from '../../onboarding/useOnboarding';
import { selectIsCreatingFormOpen } from '../selectors/customLocator.selectors';
import { setIsCreatingFormOpen } from '../customLocator.slice';

interface LocatorListHeaderProps {
  render: (viewProps: LocatorTreeProps['viewProps']) => ReactNode;
  isEditModalOpen: boolean;
  setIsEditModalOpen: (isOpen: boolean) => void;
}

const emptyLength = 0;

export const LocatorListHeader = ({
  render,
  isEditModalOpen,
  setIsEditModalOpen,
}: LocatorListHeaderProps): JSX.Element => {
  const dispatch = useDispatch();
  const [expandAll, setExpandAll] = useState(ExpandState.Expanded);
  const [searchString, setSearchString] = useState('');
  const [isAllLocatorsSelected, setIsAllLocatorsSelected] = useState<boolean>(false);

  const locators = useSelector(selectFilteredLocators);
  const generatedLocators = useSelector(selectGenerateByPageObject);
  const checkedLocators = useSelector(selectCheckedLocatorsByPageObject);
  const active = useSelector(selectActiveLocators);
  const actualSelected = useSelector(selectActualActiveByPageObject);

  const isOnboardingOpen = useSelector(selectIsOnboardingOpen);
  const isCreatingForm = useSelector(selectIsCreatingFormOpen);

  useEffect(() => {
    if (
      checkedLocators.length > emptyLength &&
      checkedLocators.length === locators.length &&
      generatedLocators.length === locators.length
    ) {
      setIsAllLocatorsSelected(true);
    }
  }, [checkedLocators.length]);

  const partiallySelected =
    checkedLocators.length > emptyLength &&
    checkedLocators.length < locators.length &&
    generatedLocators.length < locators.length; // ToDo isGenerated refactoring

  const handleOnChange = () => {
    dispatch(toggleAllLocatorsIsChecked({ locators, isChecked: !isAllLocatorsSelected }));
    setIsAllLocatorsSelected((prev) => !prev);
    // eslint-disable-next-line max-len
    dispatch(setElementGroupGeneration({ locators, isGenerated: !isAllLocatorsSelected })); // ToDo isGenerated refactoring
  };

  const customLocatorRef = useRef<HTMLElement | null>(null);
  const { updateStepRefs } = useOnboardingContext();
  const { handleOnChangeStep } = useOnboarding();

  const addCustomLocatorHandler = () => {
    dispatch(setIsCreatingFormOpen(true));
    setIsEditModalOpen(true);
    if (isOnboardingOpen) handleOnChangeStep(OnboardingStep.EditLocator);
  };

  useEffect(() => {
    if (customLocatorRef.current) {
      updateStepRefs(OnboardingStep.CustomLocator, customLocatorRef, addCustomLocatorHandler);
    }
  }, []);

  return (
    <>
      <div className="jdn__locator-list_header-locator-control-group">
        <LocatorsSearch value={searchString} onChange={setSearchString} />
        <OnboardingTooltip>
          <Button
            className="jdn__locator-list_locator-add-btn"
            disabled={isOnboardingOpen && !!size(locators)}
            ref={customLocatorRef}
            icon={<PlusOutlined size={14} />}
            size="small"
            onClick={addCustomLocatorHandler}
          >
            Custom locator
          </Button>
        </OnboardingTooltip>
      </div>

      <Row className="jdn__items-list_header">
        <span className="jdn__items-list_header-title">
          <CaretDown
            style={{
              transform: expandAll === ExpandState.Expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            className="jdn__items-list_header-collapse"
            color="#878A9C"
            size={14}
            onClick={() =>
              setExpandAll(expandAll === ExpandState.Collapsed ? ExpandState.Expanded : ExpandState.Collapsed)
            }
          />
          <Checkbox
            checked={isAllLocatorsSelected}
            indeterminate={partiallySelected}
            onClick={handleOnChange}
            disabled={!locators.length}
          />
          <Chip
            hidden={!size(active)}
            primaryLabel={size(active).toString()}
            secondaryLabel={'selected'}
            onDelete={() => dispatch(elementGroupUnsetActive(active))}
          />
        </span>
        {size(active) ? (
          <LocatorMenu {...{ trigger: ['click'], setIsEditModalOpen }}>
            <Button
              className="jdn__items-list_button jdn__items-list_button-menu"
              icon={<DotsThree size={18} onClick={(e) => e.preventDefault()} />}
            />
          </LocatorMenu>
        ) : null}
      </Row>
      {render({ expandAll, setExpandAll, searchString })}
      {isEditModalOpen ? (
        <LocatorEditDialog
          isCreatingForm
          isModalOpen={isEditModalOpen}
          setIsModalOpen={setIsEditModalOpen}
          {...(isCreatingForm ? newLocatorStub : actualSelected[0])}
        />
      ) : null}
    </>
  );
};
