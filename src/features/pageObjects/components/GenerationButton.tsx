import { SearchOutlined } from "@ant-design/icons";
import { Button, Select, Space, Typography } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../../app/store/store";
import { IdentificationStatus } from "../../locators/types/locator.types";
import { selectCurrentPageObject } from "../pageObject.selectors";
import { changeElementLibrary } from "../pageObject.slice";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary, libraryNames } from "../../locators/types/generationClasses.types";
import { identifyElements } from "../../locators/reducers/identifyElements.thunk";

interface Props {
  pageObj: PageObjectId;
  library: ElementLibrary;
}

export const GenerationButton: React.FC<Props> = ({ pageObj, library }) => {
  const status = useSelector((state: RootState) => state.locators.present.status);
  const currentPageObject = useSelector(selectCurrentPageObject);

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
            onChange={(_library) => dispatch(changeElementLibrary({ id: pageObj, library: _library }))}
          >
            <Select.Option value={ElementLibrary.MUI}>{libraryNames.MUI}</Select.Option>
            <Select.Option value={ElementLibrary.HTML5}>{libraryNames.HTML5}</Select.Option>
            <Select.Option value={ElementLibrary.Vuetify}>{libraryNames.Vuetify}</Select.Option>
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
