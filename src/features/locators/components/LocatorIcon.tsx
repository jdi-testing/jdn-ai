import React from "react";
import { Spin, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import CheckedEdited from "../assets/checked-edited.svg";
import WarningEditedSvg from "../assets/warning-edited.svg";
import { locatorTaskStatus } from "../../../common/constants/constants";
import { PauseCircle, Trash, WarningCircle } from "phosphor-react";
import { LocatorValidationErrorType, LocatorValidationWarnings, LocatorValue } from "../types/locator.types";

export const isEdited = (locator: LocatorValue) => locator.customXpath;
export const isValidLocator = (message?: string) =>
  !message?.length || message === LocatorValidationWarnings.NewElement;

interface Props {
  message?: LocatorValidationErrorType;
  locator: LocatorValue;
  deleted?: boolean;
  isCustomLocator?: boolean;
  isCreatedByUser?: boolean;
}

export const LocatorIcon: React.FC<Props> = ({ message, locator, deleted, isCustomLocator, isCreatedByUser }) => {
  const getTooltipText = () => message || "Edited";

  const startedIcon = <Spin size="small" />;
  const revokedIcon = <PauseCircle size={14} color="#d81515" className="jdn__locatorsList-status" />;
  const deletedIcon = <Trash size={14} color="#9a9da9" className="jdn__locatorsList-status" />;

  const failureIcon = (
    <Tooltip title={locator.errorMessage ?? "Locator generation was failed"}>
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
        if (isValidLocator(message) && !isCreatedByUser && isCustomLocator) {
          return successEditedIcon;
        } else if (!isValidLocator(message)) return warningEditedIcon;
        return null;
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
