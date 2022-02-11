import { Col, Row, Slider, Tooltip } from "antd";
import { useDispatch, useSelector } from "react-redux";
import { useState } from "react";
import Icon from "@ant-design/icons";
import React from "react";
import Text from "antd/lib/typography/Text";

import { changePerception } from "../../store/mainSlice";
import { floatToPercent } from "../../utils/helpers";

import "./slider.less";
import QuestionFilled from "../../assets/question-filled.svg";

let sliderTimer;
export const PerceptionTreshold = () => {
  const dispatch = useDispatch();
  const perception = useSelector((state) => state.main.perception);

  const [perceptionOutput, setPerceptionOutput] = useState(0.5);

  const handlePerceptionChange = (value) => {
    setPerceptionOutput(value);
    if (sliderTimer) clearTimeout(sliderTimer);
    sliderTimer = setTimeout(() => {
      dispatch(changePerception(value));
    }, 300);
  };

  return (
    <div className="jdn__perception-treshold">
      <Text strong level={5}>
        Prediction accuracy: {floatToPercent(perception)}%
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
        <Col span={2} className="jdn__slider-perception-min">
          <Text>0%</Text>
        </Col>
        <Col span={20}>
          <Slider
            min={0.0}
            max={1}
            step={0.01}
            onChange={handlePerceptionChange}
            value={perceptionOutput}
            tipFormatter={(value) => `${floatToPercent(value)}%`}
          />
        </Col>
        <Col span={2} className="jdn__slider-perception-max">
          <Text>100%</Text>
        </Col>
      </Row>
    </div>
  );
};
