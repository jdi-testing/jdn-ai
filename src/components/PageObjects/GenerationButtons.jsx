import { Button, Space, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { SearchOutlined } from "@ant-design/icons";
import React from "react";

import { identificationStatus } from "../../utils/constants";
import { identifyElements } from "../../store/thunks/identifyElements";
import { libraryNames, predictEndpoints } from "../../utils/generationClassesMap";
import { setElementLibrary } from "../../store/slices/locatorsSlice";

export const GenerationButtons = ({ pageObj }) => {
  const status = useSelector((state) => state.locators.status);
  const allowIdentifyElements = useSelector((state) => state.main.allowIdentifyElements);
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);
  const elementLibrary = useSelector((state) => state.locators.elementLibrary);

  const dispatch = useDispatch();
  const endpoint = predictEndpoints[elementLibrary];

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
            onChange={(value) => dispatch(setElementLibrary(value))}
          >
            <Select.Option value={predictEndpoints.MUI}>{libraryNames.MUI}</Select.Option>
            <Select.Option value={predictEndpoints.HTML5}>{libraryNames.HTML5}</Select.Option>
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
