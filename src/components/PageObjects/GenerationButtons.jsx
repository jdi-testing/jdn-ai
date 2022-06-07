import { Button, Space, Select } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { SearchOutlined } from "@ant-design/icons";
import React from "react";

import { identificationStatus } from "../../utils/constants";
import { identifyElements } from "../../store/thunks/identifyElements";
import { elementLibrary, libraryNames } from "../../utils/generationClassesMap";
import { changeElementLibrary } from "../../store/slices/pageObjectSlice";
import { selectPageObjById } from "../../store/selectors/pageObjectSelectors";

export const GenerationButtons = ({ pageObj }) => {
  const status = useSelector((state) => state.locators.status);
  const allowIdentifyElements = useSelector((state) => state.main.allowIdentifyElements);
  const currentPageObject = useSelector((state) => selectPageObjById(state, pageObj));
  const { id, library } = currentPageObject;

  const dispatch = useDispatch();

  return (
    <div className="jdn__generationButtons">
      <Space direction="vertical" size={16}>
        <Space direction="horizontal" size={8} align="center">
          <label htmlFor="library" className={`${!allowIdentifyElements ? "jdn__label--disabled" : ""}`}>
            Library:
          </label>
          <Select
            id="library"
            defaultValue={library}
            disabled={!allowIdentifyElements}
            className="jdn__select"
            onChange={(_library) => dispatch(changeElementLibrary({ id, library: _library }))}
          >
            <Select.Option value={elementLibrary.MUI}>{libraryNames.MUI}</Select.Option>
            <Select.Option value={elementLibrary.HTML5}>{libraryNames.HTML5}</Select.Option>
          </Select>
        </Space>
        <Space direction="horizontal" size={8}>
          <Button
            icon={<SearchOutlined />}
            type="primary"
            loading={status === identificationStatus.loading && currentPageObject.id === pageObj}
            disabled={!allowIdentifyElements}
            onClick={() => dispatch(identifyElements({ library, pageObj }))}
            className="jdn__buttons"
          >
            Generate
          </Button>
        </Space>
      </Space>
    </div>
  );
};
