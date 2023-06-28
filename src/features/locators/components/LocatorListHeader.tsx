import React, { ReactNode, useContext, useMemo, useState } from "react";
import { size } from "lodash";
import { Button, Checkbox, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { Chip } from "../../../common/components/Chip";
import { CaretDown, DotsThree } from "phosphor-react";
import { PlusOutlined } from "@ant-design/icons";
import { elementGroupUnsetActive, setElementGroupGeneration } from "../locators.slice";
import {
  selectActiveLocators,
  selectFilteredLocators,
  selectGenerateByPageObject,
  selectCalculatedActiveByPageObj,
  selectWaitingActiveByPageObj,
} from "../../pageObjects/pageObject.selectors";
import { newLocatorStub } from "../utils/constants";
import { LocatorsSearch } from "./LocatorsSearch";
import { LocatorEditDialog } from "./LocatorEditDialog";
import { useOnBoardingRef } from "../../onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../onboarding/types/constants";
import { OnboardingContext } from "../../onboarding/OnboardingProvider";
import { OnbrdTooltip } from "../../onboarding/components/OnbrdTooltip";
import { LocatorMenu } from "./LocatorMenu";
import { LocatorTreeProps, ExpandState } from "./LocatorsTree";

export const LocatorListHeader = ({ render }: { render: (viewProps: LocatorTreeProps["viewProps"]) => ReactNode }) => {
  const dispatch = useDispatch();
  const [expandAll, setExpandAll] = useState(ExpandState.Expanded);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCreatingForm, setIsCreatingForm] = useState(false);
  const [searchString, setSearchString] = useState("");

  const locators = useSelector(selectFilteredLocators);
  const locatorsGenerate = useSelector(selectGenerateByPageObject);
  const active = useSelector(selectActiveLocators);
  const calculatedActive = useSelector(selectCalculatedActiveByPageObj);
  const waitingActive = useSelector(selectWaitingActiveByPageObj);
  const actualSelected = useMemo(() => [...calculatedActive, ...waitingActive], [calculatedActive, waitingActive]);

  const { isOpen: isOnboardingOpen, isCustomLocatorFlow } = useContext(OnboardingContext);

  const fullySelected = size(locatorsGenerate) === size(locators);
  const partiallySelected = !!size(locatorsGenerate) && size(locatorsGenerate) < size(locators);

  const handleOnCheck = () => {
    dispatch(setElementGroupGeneration({ locators, generate: !fullySelected }));
  };

  const ref = useOnBoardingRef(
    OnbrdStep.CustomLocator,
    isCustomLocatorFlow ? () => setIsEditModalOpen(true) : undefined
  );

  return (
    <React.Fragment>
      <Row justify="space-between" align="bottom">
        <LocatorsSearch value={searchString} onChange={setSearchString} />
        <OnbrdTooltip>
          <Button
            disabled={isOnboardingOpen && !!size(locators)}
            ref={ref}
            icon={<PlusOutlined size={14} />}
            size="small"
            onClick={() => (setIsEditModalOpen(true), setIsCreatingForm(true))}
          >
            Custom locator
          </Button>
        </OnbrdTooltip>
      </Row>
      <Row className="jdn__locatorsList-header">
        <span className="jdn__locatorsList-header-title">
          <CaretDown
            style={{
              transform: expandAll === ExpandState.Expanded ? "rotate(180deg)" : "rotate(0deg)",
            }}
            className="jdn__locatorsList-header-collapse"
            color="#878A9C"
            size={14}
            onClick={() =>
              setExpandAll(expandAll === ExpandState.Collapsed ? ExpandState.Expanded : ExpandState.Collapsed)
            }
          />
          <Checkbox
            checked={fullySelected}
            indeterminate={partiallySelected}
            onClick={handleOnCheck}
            disabled={!size(locators)}
          ></Checkbox>
          <Chip
            hidden={!size(active)}
            primaryLabel={size(active).toString()}
            secondaryLabel={"selected"}
            onDelete={() => dispatch(elementGroupUnsetActive(active))}
          />
        </span>
        {size(active) ? (
          <LocatorMenu {...{ trigger: ["click"], setIsEditModalOpen }}>
            <Button
              className="jdn__locatorsList_button jdn__locatorsList_button-menu"
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
    </React.Fragment>
  );
};
