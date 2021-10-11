import React from "react";

import { Checkbox, Dropdown, Menu, Spin, Typography } from "antd";
import Icon from "@ant-design/icons";
import Text from "antd/lib/typography/Text";

import { locatorTaskStatus } from "../../utils/locatorGenerationController";
import { getPageElementCode } from "../../utils/pageObject";

import CheckedkSvg from "../../../../../icons/checked-outlined.svg";
import InvisibleSvg from "../../../../../icons/invisible.svg";
import ClockSvg from "../../../../../icons/clock-outlined.svg";
import EllipsisSvg from "../../../../../icons/ellipsis.svg";
// import SettingsSvg from "../../../../../icons/settings.svg";
// import PencilSvg from "../../../../../icons/pencil.svg";
import PlaySvg from "../../../../../icons/play.svg";
import PauseSvg from "../../../../../icons/pause.svg";
import PauseOutlinedSvg from "../../../../../icons/pause-outlined.svg";
import TrashBinSvg from "../../../../../icons/trash-bin.svg";
import RestoreSvg from "../../../../../icons/restore.svg";
import { locatorProgressStatus } from "../../utils/locatorGenerationController";

export const Locator = ({ element, onChange, stopXpathGeneration, runXpathGeneration, toggleDeleted }) => {
  const { element_id, type, name, locator, generate } = element;

  const handleOnChange = (value) => {
    onChange(element_id);
  };

  const renderIcon = () => {
    if (element.deleted) return <Icon component={InvisibleSvg} className="jdn__locatorsList-status" />;

    switch (element.locator.taskStatus) {
      case locatorTaskStatus.SUCCESS:
        return <Icon component={CheckedkSvg} className="jdn__locatorsList-status" />;
      case locatorTaskStatus.STARTED:
        return <Spin size="small" />;
      case locatorTaskStatus.PENDING:
        return <Icon component={ClockSvg} className="jdn__locatorsList-status" />;
      case locatorTaskStatus.REVOKED:
        return <Icon component={PauseOutlinedSvg} className="jdn__locatorsList-status" />;
      default:
        break;
    }
  };

  const renderMenu = () => {
    if (element.deleted) {
      return (
        <Menu>
          <Menu.Item key="5" icon={<RestoreSvg />} onClick={() => toggleDeleted(element.element_id)}>
            Restore
          </Menu.Item>
        </Menu>
      );
    } else {
      return (
        <Menu>
          {/* <Menu.Item key="1" icon={<PencilSvg />} onClick={handleMenuClick(1)}>
            Edit
          </Menu.Item>
          <Menu.Item key="2" icon={<SettingsSvg />} onClick={handleMenuClick(2)}>
            Settings
          </Menu.Item> */}
          {locatorProgressStatus.hasOwnProperty(locator.taskStatus) ? (
            <Menu.Item key="3" icon={<PauseSvg />} onClick={() => stopXpathGeneration(element)}>
              Stop generation
            </Menu.Item>
          ) : null}
          {locator.taskStatus === locatorTaskStatus.REVOKED ? (
            <Menu.Item key="4" icon={<PlaySvg />} onClick={() => runXpathGeneration([element])}>
              Rerun
            </Menu.Item>
          ) : null}
          <Menu.Item key="6" icon={<TrashBinSvg />} onClick={() => toggleDeleted(element.element_id)}>
            <Typography.Text type="danger">Delete</Typography.Text>
          </Menu.Item>
        </Menu>
      );
    }
  };

  return (
    <div>
      <Checkbox checked={generate} onChange={handleOnChange}>
        <Text className="jdn__xpath_item">
          {renderIcon()}
          {getPageElementCode(type, name, locator)}
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
