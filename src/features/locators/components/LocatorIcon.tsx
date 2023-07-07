import React from "react";
import { Spin, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import WarningEditedSvg from "../assets/warning-edited.svg";
import { PauseCircle, Trash, WarningCircle } from "phosphor-react";
import { LocatorValidationErrorType, LocatorValue, ValidationStatus, LocatorTaskStatus } from "../types/locator.types";
import { getLocatorValidationStatus } from "../utils/utils";

interface Props {
  message: LocatorValidationErrorType;
  locator: LocatorValue;
  deleted?: boolean;
  isCustomLocator?: boolean;
}

export const LocatorIcon: React.FC<Props> = ({ message, locator, deleted }) => {
  const getTooltipText = () => message || "Edited";

  const startedIcon = <Spin size="small" />;
  const revokedIcon = <PauseCircle size={14} color="#d81515" className="jdn__itemsList-status" />;
  const deletedIcon = <Trash size={14} color="#9a9da9" className="jdn__itemsList-status" />;

  const failureIcon = (
    <Tooltip title={locator.errorMessage ?? "Locator generation was failed"}>
      <WarningCircle size={14} color="#d81515" className="jdn__itemsList-status" />
    </Tooltip>
  );

  const warningEditedIcon = (
    <Tooltip title={getTooltipText()}>
      <Icon component={WarningEditedSvg} className="jdn__itemsList-status" />
    </Tooltip>
  );

  const renderIcon = () => {
    if (deleted) return deletedIcon;

    switch (locator.taskStatus) {
      case LocatorTaskStatus.SUCCESS: {
        const validationStatus = getLocatorValidationStatus(message);
        return validationStatus === ValidationStatus.WARNING || validationStatus === ValidationStatus.ERROR
          ? warningEditedIcon
          : null;
      }
      case LocatorTaskStatus.STARTED:
      case LocatorTaskStatus.PENDING:
        return startedIcon;
      case LocatorTaskStatus.REVOKED:
        return revokedIcon;
      case LocatorTaskStatus.FAILURE:
        return failureIcon;
      default:
        return null;
    }
  };

  return renderIcon();
};
