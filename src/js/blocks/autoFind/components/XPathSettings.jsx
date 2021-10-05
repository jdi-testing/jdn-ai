import React from "react";

import { Collapse, InputNumber } from "antd";
import CollapsePanel from "antd/lib/collapse/CollapsePanel";
import Checkbox from "antd/lib/checkbox/Checkbox";

import { useAutoFind } from "../autoFindProvider/AutoFindProvider";

export const XPathSettings = () => {
  const [{ xpathConfig }, { setXpathConfig }] = useAutoFind();

  const {
    maximum_generation_time,
    allow_indexes_at_the_beginning,
    allow_indexes_in_the_middle,
    allow_indexes_at_the_end,
  } = xpathConfig;

  const handleChangeXpathConfig = (value) => {
    console.log(xpathConfig);
    console.log(value);

    setXpathConfig({ ...xpathConfig, ...value });
  };

  return (
    <Collapse>
      <CollapsePanel header="xPath settings">
        <InputNumber
          min="0"
          step="1"
          defaultValue={maximum_generation_time}
          onChange={(value) => handleChangeXpathConfig({ maximum_generation_time: value })}
        />
        <label>Maximum generation time</label>
        <Checkbox
          checked={allow_indexes_at_the_beginning}
          onChange={(event) => handleChangeXpathConfig({ allow_indexes_at_the_beginning: event.target.checked })}
        >
          Allow indexes at the beginning
        </Checkbox>
        <Checkbox
          checked={allow_indexes_in_the_middle}
          onChange={(event) => handleChangeXpathConfig({ allow_indexes_in_the_middle: event.target.checked })}
        >
          Allow indexes in the middle
        </Checkbox>
        <Checkbox
          checked={allow_indexes_at_the_end}
          onChange={(event) => handleChangeXpathConfig({ allow_indexes_at_the_end: event.target.checked })}
        >
          Allow indexes at the end
        </Checkbox>
      </CollapsePanel>
    </Collapse>
  );
};
