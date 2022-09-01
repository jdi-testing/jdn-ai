import React from "react";
import { useDispatch } from "react-redux";
import { Dropdown, Typography } from "antd";
import Icon from "@ant-design/icons";
import { ArrowFatUp, ArrowFatDown, PencilSimple, Trash } from "phosphor-react";

import {
  setCalculationPriority,
  toggleDeleted,
} from "../../../store/slices/locatorsSlice";

import {
  locatorTaskStatus,
  LOCATOR_CALCULATION_PRIORITY,
} from "../../../utils/constants";
import { rerunGeneration } from "../../../store/thunks/rerunGeneration";
import { stopGeneration } from "../../../store/thunks/stopGeneration";
import { ElementLibrary, getTypesMenuOptions } from "../../PageObjects/utils/generationClassesMap";
import {
  isProgressStatus,
  locatorGenerationController,
} from "../../../services/locatorGenerationController";

import PauseSvg from "../../../assets/pause.svg";
import PlaySvg from "../../../assets/play.svg";
import RestoreSvg from "../../../assets/restore.svg";
import EllipsisSvg from "../../../assets/ellipsis.svg";
import { sendMessage } from "../../../services/connector";
import { toggleBackdrop } from "../../../store/slices/mainSlice";
import { Menu } from "../../common/Menu";
import { Locator, LocatorCalculationPriority } from "../../../store/slices/locatorSlice.types";

interface Props {
  element: Locator,
  library: ElementLibrary,
}

export const LocatorMenu: React.FC<Props> = ({ element, library }) => {
  const dispatch = useDispatch();

  const { element_id, locator, deleted, priority, jdnHash } = element;

  const isLocatorInProgress = isProgressStatus(locator.taskStatus);

  const handleEditClick = () => {
    dispatch(toggleBackdrop(true));
    sendMessage.openEditLocator({
      value: element,
      types: getTypesMenuOptions(library),
    });
  };

  const handleUpPriority = () => {
    dispatch(
      setCalculationPriority({
        element_id,
        priority: LocatorCalculationPriority.Increased,
      })
    );
    locatorGenerationController.upPriority([jdnHash]);
  };

  const handleDownPriority = () => {
    dispatch(
      setCalculationPriority({
        element_id,
        priority: LocatorCalculationPriority.Decreased,
      })
    );
    locatorGenerationController.downPriority([jdnHash]);
  };

  const renderMenu = () => {
    const items = [];
    if (deleted) {
      items.push({
        key: "0",
        icon: <RestoreSvg />,
        onClick: () => dispatch(toggleDeleted(element_id)),
        label: "Restore",
      });
    } else {
      items.push({
        key: "1",
        icon: <PencilSimple size={14} />,
        onClick: handleEditClick,
        label: "Edit",
      });
      if (isLocatorInProgress) {
        items.push({
          key: "2",
          icon: <PauseSvg />,
          onClick: () => dispatch(stopGeneration(element_id)),
          label: "Stop generation",
        });
        if (priority !== LOCATOR_CALCULATION_PRIORITY.INCREASED) {
          items.push({
            key: "3",
            icon: <ArrowFatUp size={14} />,
            onClick: () => handleUpPriority,
            label: "Up Priority",
          });
        }
        if (priority !== LOCATOR_CALCULATION_PRIORITY.DECREASED) {
          items.push({
            key: "4",
            icon: <ArrowFatDown size={14} />,
            onClick: () => handleDownPriority,
            label: "Down Priority",
          });
        }
      }
      if (locator.taskStatus === locatorTaskStatus.REVOKED) {
        items.push({
          key: "5",
          icon: <PlaySvg />,
          onClick: () => dispatch(rerunGeneration([element])),
          label: "Rerun,",
        });
      }
      if (locator.taskStatus === locatorTaskStatus.FAILURE) {
        items.push({
          key: "6",
          icon: <RestoreSvg />,
          onClick: () => dispatch(rerunGeneration([element])),
          label: "Retry",
        });
      }
      items.push({
        key: "7",
        icon: <Trash size={14} color="#FF4D4F" />,
        onClick: () => dispatch(toggleDeleted(element_id)),
        label: <Typography.Text type="danger">Delete</Typography.Text>,
      });
    }

    return <Menu {...{ items }} />;
  };

  return (
    <a>
      <Dropdown
        arrow={{ pointAtCenter: true }}
        overlay={renderMenu()}
        align={{ offset: [14, 0] }}
        trigger={["click"]}
        getPopupContainer={(triggerNode) => triggerNode}
        destroyPopupOnHide
      >
        <Icon component={EllipsisSvg} onClick={(e) => e.preventDefault()} />
      </Dropdown>
    </a>
  );
};
