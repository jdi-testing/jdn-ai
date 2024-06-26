import React from 'react';
import { Spin, Tooltip } from 'antd';
import Icon from '@ant-design/icons';
import WarningEditedSvg from '../assets/warning-edited.svg';
import { PauseCircle, Trash, WarningCircle } from '@phosphor-icons/react';
import { LocatorTaskStatus, LocatorValidationErrorType, ValidationStatus } from '../types/locator.types';
import { getLocatorValidationStatus } from '../utils/utils';

interface Props {
  message: LocatorValidationErrorType;
  locatorErrorMessage?: string;
  locatorTaskStatus: LocatorTaskStatus | null;
  deleted?: boolean;
}

export const LocatorIcon: React.FC<Props> = ({ message, locatorErrorMessage, locatorTaskStatus, deleted }) => {
  const getTooltipText = () => message || 'Edited';

  const startedIcon = <Spin size="small" />;
  const revokedIcon = <PauseCircle size={14} color="#d81515" className="jdn__locator-icon_status" />;
  const deletedIcon = <Trash size={14} color="#9a9da9" className="jdn__locator-icon_status" />;

  const failureIcon = (
    <Tooltip title={locatorErrorMessage ?? 'Locator generation was failed'}>
      <WarningCircle size={14} color="#d81515" className="jdn__locator-icon_status" />
    </Tooltip>
  );

  const warningEditedIcon = (
    <Tooltip title={getTooltipText()}>
      <Icon component={WarningEditedSvg} className="jdn__locator-icon_status--edited" />
    </Tooltip>
  );

  const renderIcon = () => {
    if (deleted) return deletedIcon;
    switch (locatorTaskStatus) {
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

  return <div className="jdn__locator-icon">{renderIcon()}</div>;
};
