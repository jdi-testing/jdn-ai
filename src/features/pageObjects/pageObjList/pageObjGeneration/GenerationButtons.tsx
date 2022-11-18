import { SearchOutlined } from "@ant-design/icons";
import { Button, Select, Space, Typography } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../../../app/store";
import { IdentificationStatus } from "../../../locators/locatorSlice.types";
import { selectPageObjById } from "../../pageObjectSelectors";
import { changeElementLibrary } from "../../pageObjectSlice";
import { PageObjectId } from "../../pageObjectSlice.types";
import { ElementLibrary, libraryNames } from "../../utils/generationClassesMap";
import { identifyElements } from "./identifyElements";

interface Props {
  pageObj: PageObjectId,
}

export const GenerationButtons: React.FC<Props> = ({ pageObj }) => {
  const status = useSelector((state: RootState) => state.locators.present.status);
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
