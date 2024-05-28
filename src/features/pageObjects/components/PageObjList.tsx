import Icon from '@ant-design/icons';
import { Collapse, Tooltip, Typography } from 'antd';
import { isNil, size } from 'lodash';
import React, { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { CaretDown } from '@phosphor-icons/react';
import PageSvg from '../assets/page.svg';
import { selectLastFrameworkType, selectPageObjects } from '../selectors/pageObjects.selectors';
import { PageObjGenerationSettings } from './PageObjGenerationSettings';
import { PageObjectPlaceholder } from './PageObjectPlaceholder';
import { PageObjCopyButton } from './PageObjCopyButton';
import { Locator } from '../../locators/Locator';
import { PageObjMenu } from './PageObjMenu';
import { PageObjListHeader } from './PageObjListHeader';
import { useNotifications } from '../../../common/components/notification/useNotifications';
import { AppDispatch, RootState } from '../../../app/store/store';
import { PageObject } from '../types/pageObjectSlice.types';
import { PageType } from '../../../app/types/mainSlice.types';
import { selectConfirmedLocators } from '../../locators/selectors/locatorsFiltered.selectors';
import { FrameworkType } from '../../../common/types/common';
import ProgressBar from './ProgressBar';
import { selectIsProgressBarFinished } from '../selectors/progressBar.selector';
import { identifyElements } from '../../locators/reducers/identifyElements.thunk';
import { OnboardingStep } from '../../onboarding/constants';
import { setHideUnadded } from '../pageObject.slice';
import { disablePageObjectsListUI } from '../pageObjectsListUI.slice';
import { resetProgressBar, startProgressBar } from '../progressBar.slice';
import { useOnboarding } from '../../onboarding/useOnboarding';
import { getTaskStatus } from '../../locators/utils/utils';

interface Props {
  jdiTemplate?: Blob;
  vividusTemplate?: Blob;
}

const DEFAULT_ACTIVE_KEY = '0';

export const PageObjList: React.FC<Props> = ({ jdiTemplate, vividusTemplate }) => {
  const state = useSelector((_state: RootState) => _state);

  // due to antd types: onChange?: (key: string | string[]) => void;
  const currentPageObjectIndex = useSelector(
    (_state: RootState): string | undefined => _state.pageObject.present.currentPageObject?.toString(),
  );
  const framework = useSelector(selectLastFrameworkType) || FrameworkType.JdiLight;
  const isProgressBarFinished = useSelector(selectIsProgressBarFinished);
  const pageObjects: PageObject[] = useSelector(selectPageObjects);
  const [activePanel, setActivePanel] = useState<string[] | undefined>([DEFAULT_ACTIVE_KEY]);

  const { isOnboardingOpen, handleOnChangeStep } = useOnboarding();

  const dispatch = useDispatch<AppDispatch>();

  const contentRef = useRef<HTMLDivElement>(null);
  useNotifications(contentRef?.current);

  const isExpanded = !!size(activePanel);

  useEffect(() => {
    if (currentPageObjectIndex) {
      setActivePanel([currentPageObjectIndex]);
    } else {
      setActivePanel([DEFAULT_ACTIVE_KEY]);
    }
  }, [currentPageObjectIndex]);

  const handleGenerate = () => {
    const pageObj = Number(activePanel?.[0]) || 0;

    if (isOnboardingOpen) handleOnChangeStep(OnboardingStep.Generating);
    dispatch(setHideUnadded({ id: pageObj, hideUnadded: false }));
    dispatch(identifyElements({ pageObj }));
    // disable UI for PageObjList settings:
    dispatch(disablePageObjectsListUI());
    // reset to default progress bar:
    dispatch(resetProgressBar());
    // show and start progress bar:
    dispatch(startProgressBar());
  };

  const toggleExpand = () => {
    if (size(activePanel)) {
      setActivePanel([]);
    } else {
      const keys = pageObjects.map(
        (pageObject) => pageObject.id.toString(), // due to antd types: onChange?: (key: string | string[]) => void;
      );
      setActivePanel(keys);
    }
  };

  const template = framework === FrameworkType.Vividus ? vividusTemplate : jdiTemplate;

  return (
    <div>
      <PageObjListHeader
        {...{
          template,
          toggleExpand,
          isExpanded,
          setActivePanel,
        }}
      />
      <div ref={contentRef} className="jdn__items-list_content jdn__pageObject-content">
        {size(pageObjects) ? (
          <>
            <Collapse
              defaultActiveKey={[DEFAULT_ACTIVE_KEY]}
              expandIcon={({ isActive }) => (
                <CaretDown
                  style={{
                    transform: isActive ? 'rotate(180deg)' : 'rotate(0deg)',
                  }}
                  size={16}
                  color="#878A9C"
                />
              )}
              expandIconPosition="start"
              {...(!isNil(activePanel) ? { activeKey: activePanel } : {})}
              onChange={(key) => setActivePanel([...key])}
            >
              {pageObjects.map((pageObject) => {
                const { id, locators, url, name, library } = pageObject;

                const elements = selectConfirmedLocators(state, id);
                const isPageObjectEmpty = !size(locators);
                const shouldDisplayLocators = !isPageObjectEmpty && isProgressBarFinished && elements.length;

                return (
                  <Collapse.Panel
                    key={id}
                    header={
                      <Tooltip
                        title={url}
                        placement="bottomLeft"
                        getPopupContainer={(triggerNode) => triggerNode}
                        align={{ offset: [-28, 0] }}
                      >
                        <Icon component={PageSvg} className="jdn__items-list_status" />
                        <Typography.Text className="jdn__pageObject-content-text">{name}</Typography.Text>
                      </Tooltip>
                    }
                    extra={
                      <>
                        {!isPageObjectEmpty && <PageObjCopyButton {...{ framework, elements, pageObjectName: name }} />}
                        <PageObjMenu {...{ pageObject, elements }} />
                      </>
                    }
                  >
                    {shouldDisplayLocators ? (
                      elements.map((element) => {
                        const locatorTaskStatus = getTaskStatus(
                          element.locatorValue.xPathStatus,
                          element.locatorValue.cssSelectorStatus,
                        );
                        const elementWithTaskStatus = { ...element, locatorTaskStatus };
                        return (
                          <Locator
                            {...{ element: elementWithTaskStatus, library }}
                            key={element.elementId}
                            currentPage={PageType.PageObject}
                          />
                        );
                      })
                    ) : (
                      <PageObjGenerationSettings pageObj={id} {...{ url, isOnboardingOpen, handleGenerate }} />
                    )}
                  </Collapse.Panel>
                );
              })}
            </Collapse>
            <ProgressBar onRetry={handleGenerate} />
          </>
        ) : (
          <PageObjectPlaceholder addPageObjectCallback={setActivePanel} />
        )}
        {/* <Notifications /> ToDo */}
      </div>
    </div>
  );
};
