import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, Row, Select, Space, Typography } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";

import { RootState } from "../../../app/store/store";
import { IdentificationStatus } from "../../locators/types/locator.types";
import { selectCurrentPageObject } from "../pageObject.selectors";
import { changeElementLibrary, setLocatorType } from "../pageObject.slice";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary, libraryNames } from "../../locators/types/generationClasses.types";
import { identifyElements } from "../../locators/reducers/identifyElements.thunk";
import { LocatorType } from "../../../common/types/common";

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
        <Row>
          <Col span={3}>
            <Typography.Text>Library:</Typography.Text>
          </Col>
          <Col span={9}>
            <Select
              id="library"
              defaultValue={library}
              className="jdn__select"
              onChange={(_library) => dispatch(changeElementLibrary({ id: pageObj, library: _library }))}
              options={[
                {
                  value: ElementLibrary.MUI,
                  label: libraryNames.MUI,
                },
                {
                  value: ElementLibrary.HTML5,
                  label: libraryNames.HTML5,
                },
                {
                  value: ElementLibrary.Vuetify,
                  label: libraryNames.Vuetify,
                },
              ]}
            />
          </Col>
        </Row>
        <Row>
          <Col span={3}>
            <Typography.Text>Locators type:</Typography.Text>
          </Col>
          <Col span={9}>
            <Select
              id="locatorType"
              defaultValue={currentPageObject?.locatorType || LocatorType.xPath}
              className="jdn__select"
              onChange={(_locatorType) => dispatch(setLocatorType({ id: pageObj, locatorType: _locatorType }))}
              options={[
                {
                  value: LocatorType.xPath,
                  label: LocatorType.xPath,
                },
                {
                  value: LocatorType.cssSelector,
                  label: LocatorType.cssSelector,
                },
              ]}
            />
          </Col>
        </Row>
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
    </div>
  );
};
