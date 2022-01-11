import { Checkbox, Dropdown, Menu, Spin, Typography } from "antd";
import { useDispatch } from "react-redux";
import Icon from "@ant-design/icons";
import React, { useEffect, useRef } from "react";
import Text from "antd/lib/typography/Text";

import { getLocator } from "../../services/pageObject";
import { getTypesMenuOptions } from "../../utils/generationClassesMap";
import { isGeneratedStatus, isProgressStatus } from "../../services/locatorGenerationController";
import { locatorTaskStatus } from "../../utils/constants";
import { openSettingsMenu } from "../../services/pageDataHandlers";
import { rerunGeneration } from "../../store/thunks/rerunGeneration";
import { stopGeneration } from "../../store/thunks/stopGeneration";
import { toggleDeleted, toggleElementGeneration } from "../../store/predictionSlice";

import CheckedkSvg from "../../assets/checked-outlined.svg";
import ClockSvg from "../../assets/clock-outlined.svg";
import DeletedSvg from "../../assets/deleted.svg";
import EllipsisSvg from "../../assets/ellipsis.svg";
import PauseOutlinedSvg from "../../assets/pause-outlined.svg";
import PauseSvg from "../../assets/pause.svg";
import PencilSvg from "../../assets/pencil.svg";
import PlaySvg from "../../assets/play.svg";
import RestoreSvg from "../../assets/restore.svg";
import SettingsSvg from "../../assets/settings.svg";
import TrashBinSvg from "../../assets/trash-bin.svg";
import WarningSvg from "../../assets/warning.svg";

export const Locator = ({ element, xpathConfig, noScrolling }) => {
  const dispatch = useDispatch();

  const { element_id, type, name, locator, generate, isCmHighlighted } = element;

  const ref = useRef(null);

  const handleOnChange = (value) => {
    dispatch(toggleElementGeneration(element_id));
  };

  useEffect(() => {
    if (generate && !noScrolling) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [generate]);

  const handleSettingsOption = () => {
    openSettingsMenu(
        element.locator.settings || xpathConfig,
        [element.element_id],
        isGeneratedStatus(element.locator.taskStatus)
    );
  };

  const handleEditClick = () => {
    chrome.storage.sync.set({ OPEN_EDIT_LOCATOR: { isOpen: true, value: element, types: getTypesMenuOptions() } });
  };

  const renderIcon = () => {
    const successIcon = <Icon component={CheckedkSvg} className="jdn__locatorsList-status" />;
    const startedIcon = <Spin size="small" />;
    const pendingIcon = <Icon component={ClockSvg} className="jdn__locatorsList-status" />;
    const revokedIcon = <Icon component={PauseOutlinedSvg} className="jdn__locatorsList-status" />;
    const failureIcon = <Icon component={WarningSvg} className="jdn__locatorsList-status" />;
    const deletedIcon = <Icon component={DeletedSvg} className="jdn__locatorsList-status" />;

    if (element.deleted) return deletedIcon;
    if (element.stopped && element.locator.taskStatus !== locatorTaskStatus.SUCCESS) return revokedIcon;

    switch (element.locator.taskStatus) {
      case locatorTaskStatus.SUCCESS:
        return successIcon;
      case locatorTaskStatus.STARTED:
        return startedIcon;
      case locatorTaskStatus.PENDING:
        return pendingIcon;
      case locatorTaskStatus.REVOKED:
        return revokedIcon;
      case locatorTaskStatus.FAILURE:
        return failureIcon;
      default:
        break;
    }
  };

  const renderColorizedString = () => {
    return (
      <React.Fragment>
        @UI(
        <span className="jdn__xpath_item-locator">&quot;{getLocator(locator)}&quot;</span>)
        <span className="jdn__xpath_item-type">&nbsp;public</span>
        <span>&nbsp;{type}&nbsp;</span>
        {name}
      </React.Fragment>
    );
  };

  const renderMenu = () => {
    if (element.deleted) {
      return (
        <Menu>
          <Menu.Item key="5" icon={<RestoreSvg />} onClick={() => dispatch(toggleDeleted(element.element_id))}>
            Restore
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu>
          <Menu.Item key="1" icon={<PencilSvg />} onClick={handleEditClick}>
            Edit
          </Menu.Item>
          <Menu.Item key="2" icon={<SettingsSvg />} onClick={handleSettingsOption}>
            Settings
          </Menu.Item>
          {isProgressStatus(locator.taskStatus) ? (
            <Menu.Item key="3" icon={<PauseSvg />} onClick={() => dispatch(stopGeneration(element.element_id))}>
              Stop generation
            </Menu.Item>
          ) : null}
          {locator.taskStatus === locatorTaskStatus.REVOKED ? (
            <Menu.Item key="4" icon={<PlaySvg />} onClick={() => dispatch(rerunGeneration([element]))}>
              Rerun
            </Menu.Item>
          ) : null}
          <Menu.Item key="6" icon={<TrashBinSvg />} onClick={() => dispatch(toggleDeleted(element.element_id))}>
            <Typography.Text type="danger">Delete</Typography.Text>
          </Menu.Item>
        </Menu>
      );
    }
  };

  return (
    <div
      ref={ref}
      className={`${generate ? "jdn__xpath_container--selected" : "jdn__xpath_container--shift"}
     ${isCmHighlighted ? "jdn__xpath_container--cm-selected" : ""}`}
    >
      <Checkbox checked={generate} onChange={handleOnChange}>
        <Text className="jdn__xpath_item">
          {renderIcon()}
          {renderColorizedString()}
        </Text>
      </Checkbox>
      <a>
        <Dropdown trigger="click" overlay={renderMenu()}>
          <Icon component={EllipsisSvg} onClick={(e) => e.preventDefault()} />
        </Dropdown>
      </a>
    </div>
  );
};
