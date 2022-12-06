import React, { useMemo, useState } from "react";
import { filter, isNil, size } from "lodash";
import { Button, Checkbox, Dropdown, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";

import { Chip } from "../../../common/components/Chip";

import { CaretDown, DotsThree } from "phosphor-react";

import {
  elementGroupUnsetActive,
  setCalculationPriority,
  setElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
} from "../locatorsSlice";
import { stopGenerationGroup } from "../../../common/thunks/stopGenerationGroup";
import { rerunGeneration } from "../../../common/thunks/rerunGeneration";
import { locatorTaskStatus, LOCATOR_CALCULATION_PRIORITY } from "../../../common/constants/constants";
import {
  selectCalculatedActiveByPageObj,
  selectCurrentPageObject,
  selectDeletedActiveByPageObj,
  selectInProgressSelectedByPageObject,
  selectWaitingActiveByPageObj,
} from "../../pageObjects/pageObjectSelectors";
import {
  advanced,
  deleteOption,
  downPriority,
  pause,
  rerun,
  restore,
  upPriority,
} from "../../../common/components/menu/menuOptions";
import { LocatorsSearch } from "./LocatorsSearch";
import { locatorGenerationController } from "../locatorGenerationController";
import { Menu } from "../../../common/components/menu/Menu";
import { Filter } from "../../filter/Filter";
import { selectActiveLocators } from "../locatorSelectors";

export const EXPAND_STATE = {
  EXPANDED: "Expanded",
  COLLAPSED: "Collapsed",
  CUSTOM: "Custom",
};

/* eslint-disable */
// remove when current file all dependencies will migrate to TS

export const LocatorListHeader = ({ render }) => {
  const dispatch = useDispatch();
  const [expandAll, setExpandAll] = useState(EXPAND_STATE.EXPANDED);
  const [searchString, setSearchString] = useState("");

  const { id: currentPageObject, locators: locatorIds } = useSelector(selectCurrentPageObject);
  const active = useSelector(selectActiveLocators);
  const calculatedActive = useSelector((_state) => selectCalculatedActiveByPageObj(_state, currentPageObject));
  const waitingActive = useSelector((_state) => selectWaitingActiveByPageObj(_state, currentPageObject));
  const deletedActive = useSelector((_state) => selectDeletedActiveByPageObj(_state, currentPageObject));

  const actualSelected = useMemo(() => [...calculatedActive, ...waitingActive], [calculatedActive, waitingActive]);

  const stoppedSelected = useMemo(
    () => filter(waitingActive, (el) => el.locator.taskStatus === locatorTaskStatus.REVOKED),
    [waitingActive]
  );

  const inProgressSelected = useSelector((_state) => selectInProgressSelectedByPageObject(_state, currentPageObject));

  const noPrioritySelected = useMemo(() => filter(inProgressSelected, (_locator) => !_locator.priority), [
    inProgressSelected,
  ]);

  const increasedPrioritySelected = useMemo(
    () =>
      filter(inProgressSelected, {
        priority: LOCATOR_CALCULATION_PRIORITY.INCREASED,
      }),
    [inProgressSelected]
  );

  const decreasedPrioritySelected = useMemo(
    () =>
      filter(inProgressSelected, {
        priority: LOCATOR_CALCULATION_PRIORITY.DECREASED,
      }),
    [inProgressSelected]
  );
  const fullySelected = size(active) === size(locatorIds);
  const partiallySelected = !!size(active) && size(active) < size(locatorIds);

  const handleOnCheck = () => {
    dispatch(setElementGroupGeneration({ ids: locatorIds, generate: !fullySelected }));
  };

  const handleDelete = () => {
    actualSelected.length > 1
      ? dispatch(toggleDeletedGroup(actualSelected, true))
      : dispatch(toggleDeleted(actualSelected[0].element_id, true));
  };

  const handleUpPriority = () => {
    const hashes = [...decreasedPrioritySelected, ...noPrioritySelected].map((element) => element.jdnHash);
    const ids = [...decreasedPrioritySelected, ...noPrioritySelected].map((element) => element.element_id);
    dispatch(
      setCalculationPriority({
        ids,
        priority: LOCATOR_CALCULATION_PRIORITY.INCREASED,
      })
    );
    locatorGenerationController.upPriority(hashes);
  };

  const handleDownPriority = () => {
    const hashes = [...increasedPrioritySelected, ...noPrioritySelected].map((element) => element.jdnHash);
    const ids = [...increasedPrioritySelected, ...noPrioritySelected].map((element) => element.element_id);
    dispatch(
      setCalculationPriority({
        ids,
        priority: LOCATOR_CALCULATION_PRIORITY.DECREASED,
      })
    );
    locatorGenerationController.downPriority(hashes);
  };

  const renderMenu = () => {
    const getRerunGeneration = (time) => () =>
      dispatch(
        rerunGeneration({
          generationData: calculatedActive,
          maxGenerationTime: time,
        })
      );

    const items = [
      ...(size(deletedActive) ? [restore(() => dispatch(toggleDeletedGroup(deletedActive)))] : []),
      ...(size(stoppedSelected) ? [rerun(() => dispatch(rerunGeneration({ generationData: stoppedSelected })))] : []),
      ...(size(inProgressSelected) ? [pause(() => dispatch(stopGenerationGroup(inProgressSelected)))] : []),
      ...(size(inProgressSelected) && (size(decreasedPrioritySelected) || size(noPrioritySelected))
        ? [upPriority(handleUpPriority)]
        : []),
      ...(size(inProgressSelected) && (size(increasedPrioritySelected) || size(noPrioritySelected))
        ? [downPriority(handleDownPriority)]
        : []),
      ...(size(calculatedActive)
        ? [
            advanced([
              getRerunGeneration(1),
              getRerunGeneration(3),
              getRerunGeneration(5),
              getRerunGeneration(10),
              getRerunGeneration(60),
              getRerunGeneration(3600),
            ]),
          ]
        : []),
      ...(size(actualSelected) ? [deleteOption(handleDelete)] : []),
    ];

    return size(items) ? <Menu {...{ items }} /> : null;
  };

  const menu = useMemo(() => renderMenu(), [active]);

  return (
    <React.Fragment>
      <Row justify="space-between">
        <LocatorsSearch value={searchString} onChange={setSearchString} />
        <Filter />
      </Row>
      <Row className="jdn__locatorsList-header">
        <span className="jdn__locatorsList-header-title">
          <CaretDown
            style={{
              transform: expandAll === EXPAND_STATE.EXPANDED ? "rotate(180deg)" : "rotate(0deg)",
            }}
            className="jdn__locatorsList-header-collapse"
            color="#878A9C"
            size={14}
            onClick={() =>
              setExpandAll(expandAll === EXPAND_STATE.COLLAPSED ? EXPAND_STATE.EXPANDED : EXPAND_STATE.COLLAPSED)
            }
          />
          <Checkbox checked={fullySelected} indeterminate={partiallySelected} onClick={handleOnCheck}></Checkbox>
          <Chip
            hidden={!size(active)}
            primaryLabel={size(active)}
            secondaryLabel={"selected"}
            onDelete={() => dispatch(elementGroupUnsetActive(active))}
          />
        </span>
        {!isNil(menu) ? (
          <Dropdown arrow={{ pointAtCenter: true }} overlay={renderMenu()} trigger={["click"]} destroyPopupOnHide>
            <Button
              className="jdn__locatorsList_button jdn__locatorsList_button-menu"
              icon={<DotsThree size={18} onClick={(e) => e.preventDefault()} />}
            />
          </Dropdown>
        ) : null}
      </Row>
      {render({ expandAll, setExpandAll, searchString })}
    </React.Fragment>
  );
};
