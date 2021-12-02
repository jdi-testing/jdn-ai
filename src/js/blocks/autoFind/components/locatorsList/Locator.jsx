import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";

import { Checkbox, Dropdown, Menu, Spin, Typography } from "antd";
import Icon from "@ant-design/icons";
import Text from "antd/lib/typography/Text";

import { isProgressStatus, locatorTaskStatus } from "../../utils/locatorGenerationController";
import { getLocator } from "../../utils/pageObject";

import CheckedkSvg from "../../../../../icons/checked-outlined.svg";
import DeletedSvg from "../../../../../icons/deleted.svg";
import ClockSvg from "../../../../../icons/clock-outlined.svg";
import WarningSvg from "../../../../../icons/warning.svg";
import EllipsisSvg from "../../../../../icons/ellipsis.svg";
import SettingsSvg from "../../../../../icons/settings.svg";
import PencilSvg from "../../../../../icons/pencil.svg";
import PlaySvg from "../../../../../icons/play.svg";
import PauseSvg from "../../../../../icons/pause.svg";
import PauseOutlinedSvg from "../../../../../icons/pause-outlined.svg";
import TrashBinSvg from "../../../../../icons/trash-bin.svg";
import RestoreSvg from "../../../../../icons/restore.svg";
import { openSettingsMenu } from "../../utils/pageDataHandlers";
import { toggleDeleted, toggleElementGeneration } from "../../redux/predictionSlice";
import { getTypesMenuOptions } from "../../utils/generationClassesMap";
import { stopGeneration } from "../../redux/thunks/stopGeneration";
import { rerunGeneration } from "../../redux/thunks/rerunGeneration";

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
    openSettingsMenu(element.locator.settings || xpathConfig, [element.element_id]);
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
    if (element.stopped) return revokedIcon;

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
