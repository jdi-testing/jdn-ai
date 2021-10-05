import React from "react";
import Text from "antd/lib/typography/Text";
import { Col, Row, Slider, Tooltip } from "antd";
import { useAutoFind } from "../autoFindProvider/AutoFindProvider";
import { useState } from "react";
import { Content } from "antd/lib/layout/layout";
import Icon from "@ant-design/icons";

import QuestionFilled from "../../../../icons/question-filled.svg";

let sliderTimer;
export const PerceptionTreshold = () => {
  const [{ perception }, { onChangePerception }] = useAutoFind();
  const [perceptionOutput, setPerceptionOutput] = useState(0.5);

  const handlePerceptionChange = (value) => {
    setPerceptionOutput(value);
    if (sliderTimer) clearTimeout(sliderTimer);
    sliderTimer = setTimeout(() => {
      onChangePerception(value);
    }, 300);
  };

  return (
    <Content className="jdn__perception-treshold"
      style={{marginTop: "24px" }} >
      <Text strong level={5}>
        Perception treshold: {perception}
      </Text>
      <Tooltip
        title="The minimum value of the
          prediction accuracy at which
          locators will get into your
          generated file."
      >
        <Icon component={QuestionFilled} style={{ marginLeft: "4px" }} />
      </Tooltip>
      <Row className="jdn__slider">
        <Col span={1} className="jdn__perception-min">
          <Text>0.0</Text>
        </Col>
        <Col span={22}>
          <Slider min={0.0} max={1} step={0.01} onChange={handlePerceptionChange} value={perceptionOutput} />
        </Col>
        <Col span={1} className="jdn__perception-max">
          <Text>1.0</Text>
        </Col>
      </Row>
    </Content>
  );
};
