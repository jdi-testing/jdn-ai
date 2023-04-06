import React from "react";
import { Spin, Tooltip } from "antd";
import Icon from "@ant-design/icons";
import CheckedEdited from "../assets/checked-edited.svg";
import WarningEditedSvg from "../assets/warning-edited.svg";
import { locatorTaskStatus } from "../../../common/constants/constants";
import { PauseCircle, Trash, WarningCircle } from "phosphor-react";
import { LocatorValue, ValidationErrorType, Validity } from "../types/locator.types";

export const isEdited = (locator: LocatorValue) => locator.customXpath;
export const isValidLocator = (validity?: Validity) =>
  !validity?.locator.length || validity?.locator === ValidationErrorType.NewElement;

interface Props {
  validity?: Validity;
  locator: LocatorValue;
  deleted?: boolean;
}

export const LocatorIcon: React.FC<Props> = ({ validity, locator, deleted }) => {
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
        if (!isValidLocator(validity)) {
          return warningEditedIcon;
        } else if (isEdited(locator)) {
          return successEditedIcon;
        } else return null;
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
