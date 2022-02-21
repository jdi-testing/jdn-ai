import { Button, Space, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { SearchOutlined } from "@ant-design/icons";
import React, { useState } from "react";

import { identificationStatus } from "../../utils/constants";
import { identifyElements } from "../../store/thunks/identifyElements";
import { MUI_PREDICT, HTML5_PREDICT } from "../../services/backend";

export const GenerationButtons = ({ pageObj }) => {
  const status = useSelector((state) => state.locators.status);
  const allowIdentifyElements = useSelector((state) => state.main.allowIdentifyElements);
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);

  const dispatch = useDispatch();
  const [endpoint, setEndpoint] = useState(MUI_PREDICT);

  return (
    <div className="jdn__generationButtons">
      <Space direction="vertical" size={16}>
        <Space direction="horizontal" size={8} align="center">
          <label htmlFor="library" className={`${!allowIdentifyElements ? "jdn__label--disabled" : ""}`}>
            Library:
          </label>
          <Select
            id="library"
            defaultValue={endpoint}
            disabled={!allowIdentifyElements}
            className="jdn__select"
            onChange={setEndpoint}
          >
            <Select.Option value={MUI_PREDICT}>Material UI</Select.Option>
            <Select.Option value={HTML5_PREDICT}>HTML 5</Select.Option>
          </Select>
        </Space>
        <Space direction="horizontal" size={8}>
          <Button
            icon={<SearchOutlined />}
            type="primary"
            loading={status === identificationStatus.loading && currentPageObject === pageObj}
            disabled={!allowIdentifyElements}
            onClick={() => dispatch(identifyElements({ endpoint, pageObj }))}
            className="jdn__buttons"
          >
            Generate
          </Button>
        </Space>
      </Space>
    </div>
  );
};
