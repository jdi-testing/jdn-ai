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
import SettingsSvg from "../../../../../icons/settings.svg";
import PlaySvg from "../../../../../icons/play.svg";
import PauseSvg from "../../../../../icons/pause.svg";
import TrashBinSvg from "../../../../../icons/trash-bin.svg";
import PencilSvg from "../../../../../icons/pencil.svg";
import RestoreSvg from "../../../../../icons/restore.svg";

export const Locator = ({ element, onChange }) => {
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
        return <Icon component={ClockSvg} className="jdn__locatorsList-status" />;
      default:
        break;
    }
  };

  const handleMenuClick = (key) => () => {
    console.log(`clicked key ${key}`);
  };

  const menu = (
    <Menu>
      <Menu.Item key="1" icon={<PencilSvg />} onClick={handleMenuClick(1)}>
        Edit
      </Menu.Item>
      <Menu.Item key="2" icon={<SettingsSvg />} onClick={handleMenuClick(2)}>
        Settings
      </Menu.Item>
      <Menu.Item key="3" icon={<PauseSvg />} onClick={handleMenuClick(3)}>
        Stop generation
      </Menu.Item>
      <Menu.Item key="4" icon={<PlaySvg />} onClick={handleMenuClick(3)}>
        Rerun
      </Menu.Item>
      <Menu.Item key="5" icon={<RestoreSvg />} onClick={handleMenuClick(3)}>
        Restore
      </Menu.Item>
      <Menu.Item key="6" icon={<TrashBinSvg />} onClick={handleMenuClick(3)}>
        <Typography.Text type="danger">Delete</Typography.Text>
      </Menu.Item>
    </Menu>
  );

  return (
    <div>
      <Checkbox checked={generate} onChange={handleOnChange}>
        <Text className="jdn__xpath_item">
          {renderIcon()}
          {getPageElementCode(type, name, locator)}
        </Text>
      </Checkbox>
      <a>
        <Dropdown trigger="click" overlay={menu}>
          <Icon component={EllipsisSvg} onClick={(e) => e.preventDefault()} />
        </Dropdown>
      </a>
    </div>
  );
};
