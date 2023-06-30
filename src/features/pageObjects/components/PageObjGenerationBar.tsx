import { Col, Row, Select, Space, Typography } from "antd";
import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";
import { selectCurrentPageObject } from "../selectors/pageObjects.selectors";
import { changeElementLibrary, removePageObject, setHideUnadded, setLocatorType } from "../pageObject.slice";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary, libraryNames } from "../../locators/types/generationClasses.types";
import { identifyElements } from "../../locators/reducers/identifyElements.thunk";
import { LocatorType } from "../../../common/types/common";
import { useOnBoardingRef } from "../../onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../onboarding/types/constants";
import { LocalStorageKey, setLocalStorage } from "../../../common/utils/localStorage";
import { Footnote } from "../../../common/components/footnote/Footnote";
import { isIdentificationLoading } from "../../locators/utils/helpers";
import { PageObjGenerationButton } from "./PageObjGenerationButton";

interface Props {
  pageObj: PageObjectId;
  library: ElementLibrary;
  url: string;
}

const libraryOptions = [
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
];

const locatorTypeOptions = [
  {
    value: LocatorType.xPath,
    label: LocatorType.xPath,
  },
  {
    value: LocatorType.cssSelector,
    label: LocatorType.cssSelector,
  },
];

export const PageObjGenerationBar: React.FC<Props> = ({ pageObj, library, url }) => {
  const status = useSelector((state: RootState) => state.locators.present.status);
  const currentPageObject = useSelector(selectCurrentPageObject);

  const handleGenerate = () => {
    dispatch(setHideUnadded({ id: pageObj, hideUnadded: false }));
    dispatch(identifyElements({ library, pageObj }));
  };

  const refSettings = useOnBoardingRef(OnbrdStep.POsettings, undefined, () => dispatch(removePageObject(pageObj)));

  const dispatch = useDispatch();

  const onLibraryChange = (library: ElementLibrary) => {
    dispatch(changeElementLibrary({ id: pageObj, library }));
    setLocalStorage(LocalStorageKey.Library, library);
  };

  const onLocatorTypeChange = (locatorType: LocatorType) => {
    dispatch(setLocatorType({ id: pageObj, locatorType }));
    setLocalStorage(LocalStorageKey.LocatorType, locatorType);
  };

  const handleEmptyPO = () => {
    dispatch(setHideUnadded({ id: pageObj, hideUnadded: true }));
    dispatch(identifyElements({ library, pageObj }));
  };

  const isLoading = () => isIdentificationLoading(status) && currentPageObject?.id === pageObj;
  const isGenerateAllLoading = () => isLoading() && !currentPageObject?.hideUnadded;
  const isGenerateEmptyLoading = () => isLoading() && currentPageObject?.hideUnadded;

  return (
    <div className="jdn__pageObject__settings">
      <Footnote className="jdn__pageObject__settings-url">{url}</Footnote>
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
                options={libraryOptions}
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
                options={locatorTypeOptions}
              />
            </Col>
          </Row>
        </Space>
        <Space>
          <PageObjGenerationButton
            refFn={() => useOnBoardingRef(OnbrdStep.Generate, () => dispatch(identifyElements({ library, pageObj })))}
            type="primary"
            loading={isGenerateAllLoading()}
            onClick={handleGenerate}
          >
            Generate All
          </PageObjGenerationButton>
          <PageObjGenerationButton
            refFn={() => useRef<HTMLDivElement>(null)} // TODO: change with onboarding step when design is ready
            loading={isGenerateEmptyLoading()}
            onClick={handleEmptyPO}
          >
            Empty Page Object
          </PageObjGenerationButton>
        </Space>
      </div>
    </div>
  );
};
