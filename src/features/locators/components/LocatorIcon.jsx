import React from "react";
import { Spin, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import CheckedEdited from "../assets/checked-edited.svg";
import WarningEditedSvg from "../assets/warning-edited.svg";
import { locatorTaskStatus, VALIDATION_ERROR_TYPE } from "../../../common/constants/constants";
import { PauseCircle, Trash, WarningCircle } from "phosphor-react";

export const VALIDATION_ERROR_MESSAGES = {
  [VALIDATION_ERROR_TYPE.DUPLICATED_LOCATOR]: "The locator for this element already exists.", // warn
  [VALIDATION_ERROR_TYPE.EMPTY_VALUE]: "The locator was not found on the page.",
  [VALIDATION_ERROR_TYPE.MULTIPLE_ELEMENTS]: " elements were found with this locator.", // warn
  [VALIDATION_ERROR_TYPE.NEW_ELEMENT]: "The locator leads to a new element on the page after editing.", // success
  [VALIDATION_ERROR_TYPE.NOT_FOUND]: "The locator was not found on the page.", // warn
};

export const isEdited = (locator) => locator.customXpath;
const isValidLocator = (validity) =>
  !validity?.locator.length || validity.locator === VALIDATION_ERROR_TYPE.NEW_ELEMENT;

export const LocatorIcon = ({ validity, locator, deleted }) => {
  const getTooltipText = () => validity?.locator || "Edited";

  const startedIcon = <Spin size="small" />;
  const revokedIcon = <PauseCircle size={14} color="#d81515" className="jdn__locatorsList-status" />;
  const deletedIcon = <Trash size={14} color="#9a9da9" className="jdn__locatorsList-status" />;

  const failureIcon = (
    <Tooltip title={locator.errorMessage}>
      <WarningCircle size={14} color="#d81515" className="jdn__locatorsList-status" />
    </Tooltip>
  );

  const successEditedIcon = (
    <Tooltip title={getTooltipText()}>
      <Icon component={CheckedEdited} className="jdn__locatorsList-status" />
    </Tooltip>
  );

  const warningEditedIcon = (
    <Tooltip title={getTooltipText()}>
      <Icon component={WarningEditedSvg} className="jdn__locatorsList-status" />
    </Tooltip>
  );

  const renderIcon = () => {
    if (deleted) return deletedIcon;

    switch (locator.taskStatus) {
      case locatorTaskStatus.SUCCESS: {
        if (isEdited(locator)) {
          return isValidLocator(validity) ? successEditedIcon : warningEditedIcon;
        } else {
          return null;
        }
      }
      case locatorTaskStatus.STARTED:
      case locatorTaskStatus.PENDING:
        return startedIcon;
      case locatorTaskStatus.REVOKED:
        return revokedIcon;
      case locatorTaskStatus.FAILURE:
        return failureIcon;
      default:
        return null;
    }
  };

  return renderIcon();
};
