import React, { useEffect, useRef } from 'react';
import { Space } from 'antd';
import { useDispatch, useSelector } from 'react-redux';
import { selectCurrentPageObject, selectPageObjects } from '../selectors/pageObjects.selectors';
import { AppDispatch, RootState } from '../../../app/store/store';
import {
  changeElementLibrary,
  setHideUnadded,
  setLocatorType,
  setAnnotationType,
  changeFrameworkType,
} from '../pageObject.slice';
import { PageObjectId } from '../types/pageObjectSlice.types';
import { ElementLibrary, libraryNames } from '../../locators/types/generationClasses.types';
import { identifyElements } from '../../locators/reducers/identifyElements.thunk';
import { LocatorType, FrameworkType, AnnotationType } from '../../../common/types/common';
import { LocalStorageKey, setLocalStorage } from '../../../common/utils/localStorage';
import { Footnote } from '../../../common/components/footnote/Footnote';
import { isIdentificationLoading } from '../../locators/utils/helpers';
import { PageObjGenerationButton } from './PageObjGenerationButton';
import { IN_DEVELOPMENT_TITLE } from '../../../common/constants/constants';

import { useOnboardingContext } from '../../onboarding/OnboardingProvider';
import { OnboardingStep } from '../../onboarding/constants';
import { selectIsPageObjectsListUIEnabled } from '../selectors/pageObjectsListUI.selectors';
import { OnboardingTooltip } from '../../onboarding/components/OnboardingTooltip';
import PageObjSettingsItem from './PageObjSettingsItem';

// ToDo move to constants
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

interface Props {
  pageObj: PageObjectId;
  library: ElementLibrary;
  url: string;
  isOnboardingOpen: boolean;
  handleGenerate: () => void;
}

export const PageObjGenerationSettings: React.FC<Props> = ({
  pageObj,
  library,
  url,
  handleGenerate,
  isOnboardingOpen,
}) => {
  const status = useSelector((state: RootState) => state.locators.present.status);
  const currentPageObject = useSelector(selectCurrentPageObject);
  const pageObjects = useSelector(selectPageObjects);

  const dispatch = useDispatch<AppDispatch>();

  const refSettings = useRef<HTMLElement | null>(null);
  const generationButtonRef = useRef<HTMLElement | null>(null);
  const { updateStepRefs } = useOnboardingContext();

  useEffect(() => {
    if (generationButtonRef.current) {
      updateStepRefs(OnboardingStep.Generate, generationButtonRef, handleGenerate);
    }
    if (refSettings.current) {
      updateStepRefs(OnboardingStep.POsettings, refSettings);
    }
  }, []);

  const currentLibrary = currentPageObject?.library;
  const isMoreThanOnePageObject = pageObjects?.length > 1;
  const currentAnnotation = currentPageObject?.annotationType;
  const isCurrentFrameworkVividus = currentPageObject?.framework === FrameworkType.Vividus;

  const onLibraryChange = (selectedLibrary: ElementLibrary) => {
    dispatch(changeElementLibrary({ id: pageObj, library: selectedLibrary }));
    setLocalStorage(LocalStorageKey.Library, selectedLibrary);
  };

  const onAnnotationTypeChange = (annotationType: AnnotationType) => {
    dispatch(setAnnotationType({ id: pageObj, annotationType }));
    setLocalStorage(LocalStorageKey.AnnotationType, annotationType);
  };

  const onFrameworkChange = (framework: FrameworkType) => {
    dispatch(changeFrameworkType({ id: pageObj, framework }));
    setLocalStorage(LocalStorageKey.Framework, framework);

    if (framework === FrameworkType.Vividus) {
      onLibraryChange(ElementLibrary.HTML5);
      onAnnotationTypeChange(AnnotationType.FindBy);
    }
  };

  const onLocatorTypeChange = (locatorType: LocatorType) => {
    dispatch(setLocatorType({ id: pageObj, locatorType }));
    setLocalStorage(LocalStorageKey.LocatorType, locatorType);
  };

  const handleEmptyPO = () => {
    dispatch(setHideUnadded({ id: pageObj, hideUnadded: true }));
    dispatch(identifyElements({ pageObj }));
  };

  const isLoading = () => isIdentificationLoading(status) && currentPageObject?.id === pageObj;
  const isGenerateAllLoading = () => isLoading() && !currentPageObject?.hideUnadded;
  const isGenerateEmptyLoading = () => isLoading() && currentPageObject?.hideUnadded;

  const isPageObjectsListUIEnabled = useSelector(selectIsPageObjectsListUIEnabled);

  return (
    <div className="jdn__pageObject__settings">
      <Footnote className="jdn__pageObject__settings-url">{url}</Footnote>
      <div className="jdn__generationButtons">
        <Space direction="vertical" size={8}>
          <div
            ref={refSettings as React.LegacyRef<HTMLDivElement>}
            className="jdn__generationButtons_onboardingMask"
          ></div>
          <PageObjSettingsItem
            label="Framework:"
            id="frameworkType"
            disabled={isMoreThanOnePageObject || !isPageObjectsListUIEnabled}
            defaultValue={currentPageObject?.framework || FrameworkType.JdiLight}
            options={frameworkTypeOptions}
            onChange={onFrameworkChange}
          />
          <PageObjSettingsItem
            label="Library:"
            id="library"
            disabled={isCurrentFrameworkVividus || !isPageObjectsListUIEnabled}
            options={libraryOptions}
            onChange={onLibraryChange}
            value={currentLibrary}
          />
          <PageObjSettingsItem
            label="Annotation:"
            id="annotationType"
            disabled={isCurrentFrameworkVividus || !isPageObjectsListUIEnabled}
            value={currentAnnotation}
            defaultValue={currentPageObject?.annotationType || AnnotationType.UI}
            onChange={onAnnotationTypeChange}
            options={annotationTypeOptions}
          />
          <PageObjSettingsItem
            label="Locators type:"
            id="locatorType"
            defaultValue={currentPageObject?.locatorType || LocatorType.xPath}
            onChange={onLocatorTypeChange}
            options={locatorTypeOptions}
            disabled={!isPageObjectsListUIEnabled}
          />
        </Space>
        <div
          ref={generationButtonRef as React.LegacyRef<HTMLDivElement>}
          style={{
            display: 'flex',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginTop: '16px',
            width: '275px',
          }}
        >
          <PageObjGenerationButton
            type="primary"
            loading={isGenerateAllLoading()}
            onClick={handleGenerate}
            disabled={!isPageObjectsListUIEnabled}
          >
            Generate All
          </PageObjGenerationButton>
          <OnboardingTooltip>
            <PageObjGenerationButton
              loading={isGenerateEmptyLoading()}
              onClick={handleEmptyPO}
              disabled={isOnboardingOpen || !isPageObjectsListUIEnabled}
            >
              Empty Page Object
            </PageObjGenerationButton>
          </OnboardingTooltip>
        </div>
      </div>
    </div>
  );
};
