import { Button, Space, Select, Typography } from "antd";
import { useSelector, useDispatch } from "react-redux";
import { SearchOutlined } from "@ant-design/icons";
import React from "react";

import { identifyElements } from "../../../store/thunks/identifyElements";
import { ElementLibrary, libraryNames } from "../utils/generationClassesMap";
import { changeElementLibrary } from "../../../store/slices/pageObjectSlice";
import { selectPageObjById } from "../../../store/selectors/pageObjectSelectors";
import { RootState } from "../../../store/store";
import { PageObjectId } from "../../../store/slices/pageObjectSlice.types";
import { IdentificationStatus } from "../../../store/slices/locatorSlice.types";

interface Props {
  pageObj: PageObjectId,
}

export const GenerationButtons: React.FC<Props> = ({ pageObj }) => {
  const status = useSelector((state: RootState) => state.locators.status);
  const currentPageObject = useSelector((state: RootState) => selectPageObjById(state, pageObj));
  const { id, library } = currentPageObject!;

  const dispatch = useDispatch();

  return (
    <div className="jdn__generationButtons">
      <Space direction="vertical" size={16}>
        <Space direction="horizontal" size={8} align="center">
          <Typography.Text>Library:</Typography.Text>
          <Select
            id="library"
            defaultValue={library}
            className="jdn__select"
            onChange={(_library) => dispatch(changeElementLibrary({ id, library: _library }))}
          >
            <Select.Option value={ElementLibrary.MUI}>{libraryNames.MUI}</Select.Option>
            <Select.Option value={ElementLibrary.HTML5}>{libraryNames.HTML5}</Select.Option>
            {/* <Select.Option value={ElementLibrary.NgMat}>{libraryNames.NgMat}</Select.Option> */}
          </Select>
        </Space>
        <Space direction="horizontal" size={8}>
          <Button
            icon={<SearchOutlined />}
            type="primary"
            loading={status === IdentificationStatus.loading && currentPageObject?.id === pageObj}
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
