import React from "react";
import { Spin, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import WarningEditedSvg from "../assets/warning-edited.svg";
import { locatorTaskStatus } from "../../../common/constants/constants";
import { PauseCircle, Trash, WarningCircle } from "phosphor-react";
import { LocatorValidationErrorType, LocatorValue, ValidationStatus } from "../types/locator.types";
import { getLocatorValidationStatus } from "../utils/utils";

interface Props {
  message: LocatorValidationErrorType;
  locator: LocatorValue;
  deleted?: boolean;
  isCustomLocator?: boolean;
  isCreatedByUser?: boolean; // seems we won't need isCreatedByUser soon
}

export const LocatorIcon: React.FC<Props> = ({ message, locator, deleted }) => {
  const getTooltipText = () => message || "Edited";

  const startedIcon = <Spin size="small" />;
  const revokedIcon = <PauseCircle size={14} color="#d81515" className="jdn__locatorsList-status" />;
  const deletedIcon = <Trash size={14} color="#9a9da9" className="jdn__locatorsList-status" />;

  const failureIcon = (
    <Tooltip title={locator.errorMessage ?? "Locator generation was failed"}>
      <WarningCircle size={14} color="#d81515" className="jdn__locatorsList-status" />
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
        return getLocatorValidationStatus(message) === ValidationStatus.WARNING ? warningEditedIcon : null;
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
