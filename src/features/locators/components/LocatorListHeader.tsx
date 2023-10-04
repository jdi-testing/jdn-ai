import React, { ReactNode, useContext, useEffect, useState } from 'react';
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
import { useOnBoardingRef } from '../../onboarding/utils/useOnboardingRef';
import { OnbrdStep } from '../../onboarding/types/constants';
import { OnboardingContext } from '../../onboarding/OnboardingProvider';
import { OnbrdTooltip } from '../../onboarding/components/OnbrdTooltip';
import { LocatorMenu } from './LocatorMenu';
import { LocatorTreeProps, ExpandState } from './LocatorsTree';
import {
  selectActiveLocators,
  selectFilteredLocators,
  selectCheckedLocatorsByPageObject,
  selectActualActiveByPageObject,
  selectGenerateByPageObject,
} from '../selectors/locatorsFiltered.selectors';

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
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [searchString, setSearchString] = useState('');
  const [isAllLocatorsSelected, setIsAllLocatorsSelected] = useState<boolean>(false);

  const locators = useSelector(selectFilteredLocators);
  const generatedLocators = useSelector(selectGenerateByPageObject);
  const checkedLocators = useSelector(selectCheckedLocatorsByPageObject);
  const active = useSelector(selectActiveLocators);
  const actualSelected = useSelector(selectActualActiveByPageObject);

  const { isOpen: isOnboardingOpen, isCustomLocatorFlow } = useContext(OnboardingContext);

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
    generatedLocators.length < locators.length; // TODO isGenerated refactoring

  const handleOnChange = () => {
    dispatch(toggleAllLocatorsIsChecked({ locators, isChecked: !isAllLocatorsSelected }));
    setIsAllLocatorsSelected((prev) => !prev);
    // eslint-disable-next-line max-len
    dispatch(setElementGroupGeneration({ locators, isGenerated: !isAllLocatorsSelected })); // TODO isGenerated refactoring
  };

  const ref = useOnBoardingRef(
    OnbrdStep.CustomLocator,
    isCustomLocatorFlow ? () => setIsEditModalOpen(true) : undefined,
  );

  return (
    <>
      <Row justify="space-between" align="bottom">
        <LocatorsSearch value={searchString} onChange={setSearchString} />
        <OnbrdTooltip>
          <Button
            disabled={isOnboardingOpen && !!size(locators)}
            ref={ref}
            icon={<PlusOutlined size={14} />}
            size="small"
            onClick={() => (setIsCreatingForm(true), setIsEditModalOpen(true))}
          >
            Custom locator
          </Button>
        </OnbrdTooltip>
      </Row>
      <Row className="jdn__itemsList-header">
        <span className="jdn__itemsList-header-title">
          <CaretDown
            style={{
              transform: expandAll === ExpandState.Expanded ? 'rotate(180deg)' : 'rotate(0deg)',
            }}
            className="jdn__itemsList-header-collapse"
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
              className="jdn__itemsList-button jdn__locatorsList_button-menu"
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
