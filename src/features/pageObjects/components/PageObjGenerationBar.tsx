import { Col, Row, Select, Space, Typography } from "antd";
import React, { useContext, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";
import { selectCurrentPageObject, selectPageObjects } from "../selectors/pageObjects.selectors";
import {
  changeElementLibrary,
  removePageObject,
  setHideUnadded,
  setLocatorType,
  setAnnotationType,
  changeFrameworkType,
} from "../pageObject.slice";
import { PageObjectId } from "../types/pageObjectSlice.types";
import { ElementLibrary, libraryNames } from "../../locators/types/generationClasses.types";
import { identifyElements } from "../../locators/reducers/identifyElements.thunk";
import { LocatorType, FrameworkType, AnnotationType } from "../../../common/types/common";
import { useOnBoardingRef } from "../../onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../../onboarding/types/constants";
import { LocalStorageKey, setLocalStorage } from "../../../common/utils/localStorage";
import { Footnote } from "../../../common/components/footnote/Footnote";
import { isIdentificationLoading } from "../../locators/utils/helpers";
import { PageObjGenerationButton } from "./PageObjGenerationButton";
import { OnboardingContext } from "../../onboarding/OnboardingProvider";
import { IN_DEVELOPMENT_TITLE } from "../../../common/constants/constants";

interface Props {
  pageObj: PageObjectId;
  library: ElementLibrary;
  url: string;
}

const libraryOptions = [
  {
    value: ElementLibrary.HTML5,
    label: libraryNames.HTML5,
  },
  {
    value: ElementLibrary.MUI,
    label: libraryNames.MUI,
  },
  {
    value: ElementLibrary.Vuetify,
    label: libraryNames.Vuetify,
  },
];

const frameworkTypeOptions = [
  {
    value: FrameworkType.JdiLight,
    label: FrameworkType.JdiLight,
    disabled: false,
  },
  {
    value: FrameworkType.Selenium,
    label: FrameworkType.Selenium,
    title: IN_DEVELOPMENT_TITLE,
    disabled: true,
  },
  {
    value: FrameworkType.Selenide,
    label: FrameworkType.Selenide,
    title: IN_DEVELOPMENT_TITLE,
    disabled: true,
  },
  {
    value: FrameworkType.Vividus,
    label: FrameworkType.Vividus,
    disabled: false,
  },
];

const annotationTypeOptions = [
  {
    value: AnnotationType.UI,
    label: AnnotationType.UI,
  },
  {
    value: AnnotationType.FindBy,
    label: AnnotationType.FindBy,
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
  const pageObjects = useSelector(selectPageObjects);
  const { isOpen: isOnboardingOpen } = useContext(OnboardingContext);

  const handleGenerate = () => {
    dispatch(setHideUnadded({ id: pageObj, hideUnadded: false }));
    dispatch(identifyElements({ library, pageObj }));
  };

  const refSettings = useOnBoardingRef(OnbrdStep.POsettings, undefined, () => dispatch(removePageObject(pageObj)));

  const dispatch = useDispatch();

  const currentLibrary = currentPageObject?.library;
  const isMoreThanOnePageObject = pageObjects?.length > 1;
  const isCurrentFrameworkVividus = currentPageObject?.framework === FrameworkType.Vividus;

  const onLibraryChange = (library: ElementLibrary) => {
    dispatch(changeElementLibrary({ id: pageObj, library }));
    setLocalStorage(LocalStorageKey.Library, library);
  };

  const onFrameworkChange = async (framework: FrameworkType) => {
    dispatch(changeFrameworkType({ id: pageObj, framework }));
    setLocalStorage(LocalStorageKey.Framework, framework);

    if (framework === FrameworkType.Vividus) {
      onLibraryChange(ElementLibrary.HTML5);
    }
  };

  const onAnnotationTypeChange = (annotationType: AnnotationType) => {
    dispatch(setAnnotationType({ id: pageObj, annotationType }));
    setLocalStorage(LocalStorageKey.AnnotationType, annotationType);
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
              <Typography.Text>Framework:</Typography.Text>
            </Col>
            <Col flex="auto">
              <Select
                id="frameworkType"
                disabled={isMoreThanOnePageObject}
                defaultValue={currentPageObject?.framework || FrameworkType.JdiLight}
                className="jdn__select"
                options={frameworkTypeOptions}
                onChange={onFrameworkChange}
              />
            </Col>
          </Row>
          <Row>
            <Col flex="104px">
              <Typography.Text>Library:</Typography.Text>
            </Col>
            <Col flex="auto">
              <Select
                id="library"
                disabled={isCurrentFrameworkVividus}
                value={currentLibrary}
                defaultValue={library}
                className="jdn__select"
                onChange={onLibraryChange}
                options={libraryOptions}
              />
            </Col>
          </Row>
          <Row>
            <Col flex="104px">
              <Typography.Text>Annotation:</Typography.Text>
            </Col>
            <Col flex="auto">
              <Select
                id="annotationType"
                defaultValue={currentPageObject?.annotationType || AnnotationType.UI}
                className="jdn__select"
                onChange={onAnnotationTypeChange}
                options={annotationTypeOptions}
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
            disabled={isOnboardingOpen}
          >
            Empty Page Object
          </PageObjGenerationButton>
        </Space>
      </div>
    </div>
  );
};
