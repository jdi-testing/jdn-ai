import React, { useMemo, useState } from "react";
import { filter, size } from "lodash";
import { Checkbox, Dropdown, Row } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";

import { Chip } from "./Chip";
import { Menu } from "../common/Menu";

import EllipsisSvg from "../../assets/ellipsis.svg";
import { CaretDown } from "phosphor-react";

import {
  setCalculationPriority,
  setElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
  toggleElementGroupGeneration,
} from "../../store/slices/locatorsSlice";
import { stopGenerationGroup } from "../../store/thunks/stopGenerationGroup";
import { rerunGeneration } from "../../store/thunks/rerunGeneration";
import {
  locatorTaskStatus,
  LOCATOR_CALCULATION_PRIORITY,
} from "../../utils/constants";
import { locatorGenerationController } from "../../services/locatorGenerationController";
import { selectInProgressSelectedByPageObject } from "../../store/selectors/pageObjectSelectors";
import {
  advanced,
  deleteOption,
  downPriority,
  pause,
  restore,
  upPriority,
} from "./menuOptions";

export const EXPAND_STATE = {
  EXPANDED: "EXPANDED",
  COLLAPSED: "COLLAPSED",
  CUSTOM: "CUSTOM",
};

/* eslint-disable */
// remove when current file all dependencies will migrate to TS

export const LocatorListHeader = ({
  generatedSelected,
  waitingSelected,
  deletedSelected,
  locatorIds,
  render,
}) => {
  const dispatch = useDispatch();
  const [expandAll, setExpandAll] = useState(EXPAND_STATE.EXPANDED);

  const currentPageObject = useSelector(
    (_state) => _state.pageObject.currentPageObject
  );
  const selected = [
    ...generatedSelected,
    ...waitingSelected,
    ...deletedSelected,
  ];
  const activeSelected = [...generatedSelected, ...waitingSelected];
  const stoppedSelected = filter(
    waitingSelected,
    (el) => el.locator.taskStatus === locatorTaskStatus.REVOKED
  );
  const inProgressSelected = useSelector((_state) =>
    selectInProgressSelectedByPageObject(_state, currentPageObject)
  );

  const noPrioritySelected = useMemo(
    () => filter(inProgressSelected, (_locator) => !_locator.priority),
    [inProgressSelected]
  );

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
  const fullySelected = size(selected) === size(locatorIds);
  const partiallySelected =
    !!size(selected) && size(selected) < size(locatorIds);

  const handleOnCheck = () => {
    dispatch(
      setElementGroupGeneration({ ids: locatorIds, generate: !fullySelected })
    );
  };

  const handleDelete = () => {
    activeSelected.length > 1
      ? dispatch(toggleDeletedGroup(activeSelected, true))
      : dispatch(toggleDeleted(activeSelected[0].element_id, true));
  };

  const handleUpPriority = () => {
    const hashes = [...decreasedPrioritySelected, ...noPrioritySelected].map(
      (element) => element.jdnHash
    );
    const ids = [...decreasedPrioritySelected, ...noPrioritySelected].map(
      (element) => element.element_id
    );
    dispatch(
      setCalculationPriority({
        ids,
        priority: LOCATOR_CALCULATION_PRIORITY.INCREASED,
      })
    );
    locatorGenerationController.upPriority(hashes);
  };

  const handleDownPriority = () => {
    const hashes = [...increasedPrioritySelected, ...noPrioritySelected].map(
      (element) => element.jdnHash
    );
    const ids = [...increasedPrioritySelected, ...noPrioritySelected].map(
      (element) => element.element_id
    );
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
          generationData: generatedSelected,
          maxGenerationTime: time,
        })
      );

    const items = [
      ...(size(deletedSelected)
        ? [restore(() => dispatch(toggleDeletedGroup(deletedSelected)))]
        : []),
      ...(size(stoppedSelected)
        ? rerun(() => [
            dispatch(rerunGeneration({ generationData: stoppedSelected })),
          ])
        : []),
      ...(size(inProgressSelected)
        ? [pause(() => dispatch(stopGenerationGroup(inProgressSelected)))]
        : []),
      ...(size(inProgressSelected) &&
      (size(decreasedPrioritySelected) || size(noPrioritySelected))
        ? [upPriority(handleUpPriority)]
        : []),
      ...(size(inProgressSelected) &&
      (size(increasedPrioritySelected) || size(noPrioritySelected))
        ? [downPriority(handleDownPriority)]
        : []),
      ...(size(generatedSelected)
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
      ...[deleteOption(handleDelete)],
    ];

    return <Menu {...{ items }} />;
  };

  return (
    <React.Fragment>
      <Row className="jdn__locatorsList-header">
        <span className="jdn__locatorsList-header-title">
          <CaretDown
            style={{
              transform:
                expandAll === EXPAND_STATE.EXPANDED
                  ? "rotate(180deg)"
                  : "rotate(0deg)",
            }}
            color="#878A9C"
            size={14}
            onClick={() =>
              setExpandAll(
                expandAll === EXPAND_STATE.COLLAPSED
                  ? EXPAND_STATE.EXPANDED
                  : EXPAND_STATE.COLLAPSED
              )
            }
          />
          <Checkbox
            checked={fullySelected}
            indeterminate={partiallySelected}
            onClick={handleOnCheck}
          ></Checkbox>
          Locators list
        </span>
        <Chip
          hidden={!size(selected)}
          primaryLabel={size(selected)}
          secondaryLabel={"selected"}
          onDelete={() => dispatch(toggleElementGroupGeneration(selected))}
        />
        <div className="jdn__locatorsList-header-buttons">
          <Dropdown
            arrow={{ pointAtCenter: true }}
            overlay={renderMenu()}
            trigger={["click"]}
            destroyPopupOnHide
          >
            <Icon component={EllipsisSvg} onClick={(e) => e.preventDefault()} />
          </Dropdown>
        </div>
      </Row>
      {render({ expandAll, setExpandAll })}
    </React.Fragment>
  );
};
