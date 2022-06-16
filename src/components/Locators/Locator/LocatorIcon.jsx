import React from "react";
import { Spin, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import CheckedEdited from "../../../assets/checked-edited.svg";
import PauseOutlinedSvg from "../../../assets/pause-outlined.svg";
import WarningEditedSvg from "../../../assets/warning-edited.svg";
import ErrorSvg from "../../../assets/error-outlined.svg";
import TrashBinSvg from "../../../assets/delete_14.svg";
import { locatorTaskStatus, VALIDATION_ERROR_TYPE } from "../../../utils/constants";

export const VALIDATION_ERROR_MESSAGES = {
  [VALIDATION_ERROR_TYPE.DUPLICATED_LOCATOR]: "The locator for this element already exists.", // warn
  [VALIDATION_ERROR_TYPE.EMPTY_VALUE]: "The locator was not found on the page.",
  [VALIDATION_ERROR_TYPE.MULTIPLE_ELEMENTS]: " elements were found with this locator.", // warn
  [VALIDATION_ERROR_TYPE.NEW_ELEMENT]: "The locator leads to a new element on the page after editing.", // success
  [VALIDATION_ERROR_TYPE.NOT_FOUND]: "The locator was not found on the page.", // warn
};

const isEdited = (locator) => locator.customXpath;
const isValidLocator = (validity) =>
  !validity?.locator.length || validity.locator === VALIDATION_ERROR_TYPE.NEW_ELEMENT;

export const LocatorIcon = ({ validity, locator, deleted }) => {
  const getTooltipText = () => VALIDATION_ERROR_MESSAGES[validity?.locator] || "Edited";

  const startedIcon = <Spin size="small" />;
  const revokedIcon = <Icon component={PauseOutlinedSvg} className="jdn__locatorsList-status" />;
  const failureIcon = <Icon component={ErrorSvg} className="jdn__locatorsList-status" />;
  const deletedIcon = <Icon component={TrashBinSvg} className="jdn__locatorsList-status" />;

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
          break;
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
        break;
    }
  };

  return <React.Fragment>{renderIcon()}</React.Fragment>;
};
