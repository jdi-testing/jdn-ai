import { SearchOutlined } from "@ant-design/icons";
import { Button, Col, Row, Select, Space, Typography } from "antd";
import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";
import { IdentificationStatus } from "../../locators/types/locator.types";
import { selectCurrentPageObject } from "../selectors/pageObjects.selectors";
import { changeElementLibrary, removePageObject, setLocatorType } from "../pageObject.slice";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary, libraryNames } from "../../locators/types/generationClasses.types";
import { identifyElements } from "../../locators/reducers/identifyElements.thunk";
import { LocatorType } from "../../../common/types/common";
import { useOnBoardingRef } from "../../onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../onboarding/types/constants";
import { LocalStorageKey, setLocalStorage } from "../../../common/utils/localStorage";

interface Props {
  pageObj: PageObjectId;
  library: ElementLibrary;
}

export const GenerationButton: React.FC<Props> = ({ pageObj, library }) => {
  const status = useSelector((state: RootState) => state.locators.present.status);
  const currentPageObject = useSelector(selectCurrentPageObject);

  const handleGenerate = () => dispatch(identifyElements({ library, pageObj }));

  const refSettings = useOnBoardingRef(OnbrdStep.POsettings, undefined, () => dispatch(removePageObject(pageObj)));
  const refGenerate = useOnBoardingRef(OnbrdStep.Generate, () => dispatch(identifyElements({ library, pageObj })));

  const dispatch = useDispatch();

  const onLibraryChange = (library: ElementLibrary) => {
    dispatch(changeElementLibrary({ id: pageObj, library }));
    setLocalStorage(LocalStorageKey.Library, library);
  };

  const onLocatorTypeChange = (locatorType: LocatorType) => {
    dispatch(setLocatorType({ id: pageObj, locatorType }));
    setLocalStorage(LocalStorageKey.LocatorType, locatorType);
  };

  return (
    <div className="jdn__generationButtons">
      <Space direction="vertical" size={16}>
        <div ref={refSettings} className="jdn__generationButtons_onboardingMask"></div>
        <Row>
          <Col flex="104px">
            <Typography.Text>Library:</Typography.Text>
          </Col>
          <Col flex="auto">
            <Select
              id="library"
              defaultValue={library}
              className="jdn__select"
              onChange={onLibraryChange}
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
          <Col flex="104px">
            <Typography.Text>Locators type:</Typography.Text>
          </Col>
          <Col flex="auto">
            <Select
              id="locatorType"
              defaultValue={currentPageObject?.locatorType || LocatorType.xPath}
              className="jdn__select"
              onChange={onLocatorTypeChange}
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
      </Space>
      <Button
        ref={refGenerate}
        icon={<SearchOutlined />}
        type="primary"
        loading={status === IdentificationStatus.loading && currentPageObject?.id === pageObj}
        onClick={handleGenerate}
        className="jdn__buttons jdn__generationButtons_generate"
      >
        Generate
      </Button>
    </div>
  );
};
