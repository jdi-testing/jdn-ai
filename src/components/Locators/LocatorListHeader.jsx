import { Button, Checkbox } from "antd";
import { filter, size } from "lodash";
import { useDispatch } from "react-redux";
import Icon from "@ant-design/icons";
import React, { useState } from "react";

import { Chip } from "./Chip";

import PauseSVG from "../../assets/pause.svg";
import PlaySvg from "../../assets/play.svg";
import RestoreSvg from "../../assets/restore.svg";
import TrashBinSVG from "../../assets/trash-bin.svg";
import { CaretDown } from "phosphor-react";

import {
  setElementGroupGeneration,
  toggleDeleted,
  toggleDeletedGroup,
  toggleElementGroupGeneration,
} from "../../store/slices/locatorsSlice";
import { stopGenerationGroup } from "../../store/thunks/stopGenerationGroup";
import { rerunGeneration } from "../../store/thunks/rerunGeneration";
import { locatorTaskStatus } from "../../utils/constants";

export const EXPAND_STATE = {
  EXPANDED: "EXPANDED",
  COLLAPSED: "COLLAPSED",
  CUSTOM: "CUSTOM",
};

export const LocatorListHeader = ({ generatedSelected, waitingSelected, deletedSelected, locatorIds, render }) => {
  const dispatch = useDispatch();
  const [expandAll, setExpandAll] = useState(EXPAND_STATE.EXPANDED);

  const selected = [...generatedSelected, ...waitingSelected, ...deletedSelected];
  const activeSelected = [...generatedSelected, ...waitingSelected];
  const stoppedSelected = filter(waitingSelected, (el) => el.locator.taskStatus === locatorTaskStatus.REVOKED);
  const inProgressSelected = filter(waitingSelected, (el) => el.locator.taskStatus !== locatorTaskStatus.REVOKED);

  const fullySelected = size(selected) === size(locatorIds);
  const partiallySelected = !!size(selected) && size(selected) < size(locatorIds);

  const handleDelete = () => {
    activeSelected.length > 1 ?
      dispatch(toggleDeletedGroup(activeSelected, true)) :
      dispatch(toggleDeleted(activeSelected[0].element_id, true));
  };

  const handleOnCheck = () => {
    dispatch(setElementGroupGeneration({ ids: locatorIds, generate: !fullySelected }));
  };

  return (
    <React.Fragment>
      <div className="jdn__locatorsList-header">
        <CaretDown
          style={{ transform: expandAll === EXPAND_STATE.EXPANDED ? "rotate(180deg)" : "rotate(0deg)" }}
          color="#878A9C"
          size={14}
          onClick={() =>
            setExpandAll(expandAll === EXPAND_STATE.COLLAPSED ? EXPAND_STATE.EXPANDED : EXPAND_STATE.COLLAPSED)
          }
        />
        <Checkbox checked={fullySelected} indeterminate={partiallySelected} onClick={handleOnCheck}></Checkbox>
        <span className="jdn__locatorsList-header-title">Locators list</span>
        <Chip
          hidden={!size(selected)}
          primaryLabel={size(selected)}
          secondaryLabel={"selected"}
          onDelete={() => dispatch(toggleElementGroupGeneration(selected))}
        />
        <div className="jdn__locatorsList-header-buttons">
          <Button
            hidden={!size(deletedSelected)}
            className="jdn__buttons"
            onClick={() => dispatch(toggleDeletedGroup(deletedSelected))}
          >
            <Icon component={RestoreSvg} />
            Restore
          </Button>
          <Button hidden={!size(stoppedSelected)} onClick={() => dispatch(rerunGeneration(stoppedSelected))}>
            <Icon component={PlaySvg} />
          </Button>
          <Button
            hidden={!size(inProgressSelected)}
            danger
            onClick={() => dispatch(stopGenerationGroup(inProgressSelected))}
          >
            <Icon component={PauseSVG} />
          </Button>
          <Button hidden={!size(activeSelected)} danger onClick={handleDelete}>
            <Icon fill="#D82C15" component={TrashBinSVG} />
          </Button>
        </div>
      </div>
      {render({ expandAll, setExpandAll })}
    </React.Fragment>
  );
};
