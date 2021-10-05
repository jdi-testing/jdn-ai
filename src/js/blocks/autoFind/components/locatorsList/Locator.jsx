import { Checkbox } from "antd";
import Text from "antd/lib/typography/Text";
import React from "react";
import { getPageElementCode } from "../../utils/pageObject";

export const Locator = ({ element, onChange }) => {
  const { element_id, type, name, locator, generate } = element;

  const handleOnChange = (value) => {
    onChange(element_id);
  };

  return (
    <React.Fragment>
      <Checkbox checked={generate} onChange={handleOnChange}>
        <Text className="jdn__xpath_item">
          {locator.taskStatus} {getPageElementCode(type, name, locator)}
        </Text>
      </Checkbox>
    </React.Fragment>
  );
};
