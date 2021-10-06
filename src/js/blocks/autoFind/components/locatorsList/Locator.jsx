import React from "react";

import { Checkbox, Spin } from "antd";
import Icon from "@ant-design/icons";
import Text from "antd/lib/typography/Text";

import { locatorTaskStatus } from "../../utils/locatorGenerationController";
import { getPageElementCode } from "../../utils/pageObject";

import CheckedkSvg from "../../../../../icons/checked-outlined.svg";
import InvisibleSvg from "../../../../../icons/invisible.svg";
import ClockSvg from "../../../../../icons/clock-outlined.svg";

export const Locator = ({ element, onChange }) => {
  const { element_id, type, name, locator, generate } = element;

  const handleOnChange = (value) => {
    onChange(element_id);
  };

  const renderIcon = () => {
    if (element.deleted) return <Icon component={InvisibleSvg} />;

    switch (element.locator.taskStatus) {
      case locatorTaskStatus.SUCCESS:
        return <Icon component={CheckedkSvg} />;
      case locatorTaskStatus.STARTED:
        return <Spin size="small" />;
      case locatorTaskStatus.PENDING:
        return <Icon component={ClockSvg} />;
      case locatorTaskStatus.REVOKED:
        return <Icon component={ClockSvg} />;
      default:
        break;
    }
  };

  return (
    <React.Fragment>
      <Checkbox checked={generate} onChange={handleOnChange}>
        {renderIcon()}
        <Text className="jdn__xpath_item">
          {getPageElementCode(type, name, locator)}
        </Text>
      </Checkbox>
    </React.Fragment>
  );
};
