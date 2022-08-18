import React from "react";
import { useDispatch } from "react-redux";
import { Dropdown, Menu, Typography } from "antd";
import Icon from "@ant-design/icons";
import { ArrowFatUp, ArrowFatDown } from "phosphor-react";

import { setCalculationPriority, toggleDeleted } from "../../../store/slices/locatorsSlice";

import { locatorTaskStatus, LOCATOR_CALCULATION_PRIORITY } from "../../../utils/constants";
import { rerunGeneration } from "../../../store/thunks/rerunGeneration";
import { stopGeneration } from "../../../store/thunks/stopGeneration";
import { getTypesMenuOptions } from "../../../utils/generationClassesMap";
import { isProgressStatus, locatorGenerationController } from "../../../services/locatorGenerationController";

import PauseSvg from "../../../assets/pause.svg";
import PencilSvg from "../../../assets/pencil.svg";
import PlaySvg from "../../../assets/play.svg";
import RestoreSvg from "../../../assets/restore.svg";
import TrashBinSvg from "../../../assets/delete_14.svg";
import EllipsisSvg from "../../../assets/ellipsis.svg";

export const LocatorMenu = ({ element, library }) => {
  const dispatch = useDispatch();

  const { element_id, locator, deleted, priority, jdnHash } = element;

  const isLocatorInProgress = isProgressStatus(locator.taskStatus);

  const handleEditClick = () => {
    chrome.storage.sync.set({
      OPEN_EDIT_LOCATOR: { isOpen: true, value: element, types: getTypesMenuOptions(library) },
    });
  };

  const handleUpPriority = () => {
    dispatch(setCalculationPriority({ element_id, priority: LOCATOR_CALCULATION_PRIORITY.INCREASED }));
    locatorGenerationController.upPriority([jdnHash]);
  };

  const handleDownPriority = () => {
    dispatch(setCalculationPriority({ element_id, priority: LOCATOR_CALCULATION_PRIORITY.DECREASED }));
    locatorGenerationController.downPriority([jdnHash]);
  };

  const renderMenu = () => {
    if (deleted) {
      return (
        <Menu>
          <Menu.Item key="5" icon={<RestoreSvg />} onClick={() => dispatch(toggleDeleted(element_id))}>
            Restore
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu>
          <Menu.Item key="0" icon={<PencilSvg />} onClick={handleEditClick}>
            Edit
          </Menu.Item>
          {isLocatorInProgress ? (
            <React.Fragment>
              <Menu.Item key="1" icon={<PauseSvg />} onClick={() => dispatch(stopGeneration(element_id))}>
                Stop generation
              </Menu.Item>
              {priority !== LOCATOR_CALCULATION_PRIORITY.INCREASED ? (
                <Menu.Item
                  hidden={true}
                  key="4"
                  icon={<ArrowFatUp color="#fff" size={14} />}
                  onClick={handleUpPriority}
                >
                  Up Priority
                </Menu.Item>
              ) : null}
              {priority !== LOCATOR_CALCULATION_PRIORITY.DECREASED ? (
                <Menu.Item
                  hidden={true}
                  key="5"
                  icon={<ArrowFatDown color="#fff" size={14} />}
                  onClick={handleDownPriority}
                >
                  Down Priority
                </Menu.Item>
              ) : null}
            </React.Fragment>
          ) : null}
          {locator.taskStatus === locatorTaskStatus.REVOKED ? (
            <Menu.Item key="2" icon={<PlaySvg />} onClick={() => dispatch(rerunGeneration([element]))}>
              Rerun
            </Menu.Item>
          ) : null}
          {locator.taskStatus === locatorTaskStatus.FAILURE ? (
            <Menu.Item key="6" icon={<RestoreSvg />} onClick={() => dispatch(rerunGeneration([element]))}>
              Retry
            </Menu.Item>
          ) : null}
          <Menu.Item key="3" icon={<TrashBinSvg />} onClick={() => dispatch(toggleDeleted(element_id))}>
            <Typography.Text type="danger">Delete</Typography.Text>
          </Menu.Item>
        </Menu>
      );
    }
  };

  return (
    <a>
      <Dropdown overlay={renderMenu()} align={{ offset: [14, 0] }} trigger={["click"]}>
        <Icon component={EllipsisSvg} onClick={(e) => e.preventDefault()} />
      </Dropdown>
    </a>
  );
};
