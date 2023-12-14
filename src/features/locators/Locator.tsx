// ToDo fix naming according to naming-convention
/* eslint-disable @typescript-eslint/naming-convention */
import React, { useEffect, useRef, useState, useMemo, FC, useLayoutEffect } from 'react';
import { Checkbox, Button } from 'antd';
import { DotsThree } from '@phosphor-icons/react';
import Text from 'antd/lib/typography/Text';
import { useDispatch, useSelector } from 'react-redux';

import { areChildrenChecked, isLocatorIndeterminate } from './selectors/locators.selectors';
import { isMacPlatform } from '../../common/utils/helpers';
import {
  elementSetActive,
  elementUnsetActive,
  elementGroupUnsetActive,
  setActiveSingle,
  toggleLocatorIsChecked,
  setChildrenIsChecked,
  toggleElementGeneration,
  setChildrenGeneration,
} from './locators.slice';

import { size } from 'lodash';
import { PageType } from '../../app/types/mainSlice.types';
import { RootState } from '../../app/store/store';
import { ILocator } from './types/locator.types';
import { SearchState } from './components/LocatorsTree';
import { LocatorEditDialog } from './components/LocatorEditDialog';
import { LocatorCopyButton } from './components/LocatorCopyButton';
import { LocatorIcon } from './components/LocatorIcon';
import { LocatorMenu } from './components/LocatorMenu';
import { setIndents } from './utils/utils';
import { setScriptMessage } from '../../app/main.slice';
import { OnboardingTooltip } from '../onboarding/components/OnboardingTooltip';
import { selectCalculatedActiveByPageObj, selectWaitingActiveByPageObj } from './selectors/locatorsFiltered.selectors';
import { isLocatorListPage } from '../../app/utils/helpers';
import { selectCurrentPageObject } from '../pageObjects/selectors/pageObjects.selectors';
import { AnnotationType, FrameworkType, LocatorType } from '../../common/types/common';
import { getLocatorTemplateWithVividus, renderColorizedJdiString } from './utils/locatorOutput';
import { ScriptMsg } from '../../pageServices/scriptMsg.constants';
import { OnboardingStep } from '../onboarding/constants';
import { useOnboardingContext } from '../onboarding/OnboardingProvider';

interface Props {
  element: ILocator;
  currentPage: PageType;
  disabled?: boolean;
  searchState?: SearchState;
  depth?: number;
  searchString?: string;
  index?: number;
}

export const Locator: FC<Props> = ({ element, currentPage, searchState, depth, searchString, index }) => {
  const dispatch = useDispatch();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const {
    element_id,
    type,
    name,
    locatorValue,
    message: elementMessage,
    deleted,
    active,
    isCustomLocator,
    isChecked,
    annotationType: elementAnnotationType,
    locatorType: elementLocatorType,
  } = element;

  const currentPageObject = useSelector(selectCurrentPageObject);
  const { updateStepRefs, modifyStepRefByKey } = useOnboardingContext();
  const isFirstLocator = (index ?? 0) + (depth ?? 0) === 0;

  const ref = useRef<HTMLDivElement>(null);

  const menuRef = isFirstLocator ? React.createRef<HTMLElement>() : null;
  useLayoutEffect(() => {
    if (!isFirstLocator) return;
    if (menuRef) {
      updateStepRefs(OnboardingStep.ContextMenu, menuRef);
    }
  }, []);

  const addToPORef = React.createRef<HTMLInputElement>();
  useLayoutEffect(() => {
    if (!isFirstLocator) return;
    modifyStepRefByKey(OnboardingStep.AddToPO, addToPORef, { disabled: !isChecked });
    if (addToPORef.current) {
      updateStepRefs(OnboardingStep.AddToPO, addToPORef);
    }
  }, [isChecked]);

  const indeterminate = useSelector((state: RootState) => isLocatorIndeterminate(state, element_id));
  const allChildrenChecked = useSelector((state: RootState) => areChildrenChecked(state, element_id));
  const scriptMessage = useSelector((_state: RootState) => _state.main.scriptMessage);
  const calculatedActive: ILocator[] = useSelector(selectCalculatedActiveByPageObj);
  const waitingActive = useSelector(selectWaitingActiveByPageObj);
  const actualSelected = useMemo(() => [...calculatedActive, ...waitingActive], [calculatedActive, waitingActive]);

  useEffect(() => {
    if (ref && depth) {
      setIndents(ref, depth);
    }
  }, [searchString]);

  useEffect(() => {
    const message = scriptMessage?.message;
    const param = scriptMessage?.param;

    switch (message) {
      case ScriptMsg.OpenEditLocator:
        if (param?.value.element_id !== element_id) return;
        setIsEditModalOpen(true);
        dispatch(setScriptMessage({}));
        break;
    }
  }, [scriptMessage]);

  if (!currentPageObject) return null;

  const { name: pageObjectName, framework } = currentPageObject;

  const annotationType: AnnotationType = elementAnnotationType;

  const locatorType: LocatorType = elementLocatorType;

  const isVividusFramework = framework === FrameworkType.Vividus;

  const handleOnChange: React.MouseEventHandler<HTMLDivElement> = () => {
    dispatch(toggleLocatorIsChecked(element_id));
    dispatch(toggleElementGeneration(element_id)); // ToDo isGenerated refactoring
    if (allChildrenChecked && size(element.children)) {
      dispatch(setChildrenIsChecked({ locator: element, isChecked: false }));
      dispatch(setChildrenGeneration({ locator: element, isGenerated: false })); // ToDo isGenerated refactoring
    } else {
      dispatch(setChildrenIsChecked({ locator: element, isChecked: true }));
      dispatch(setChildrenGeneration({ locator: element, isGenerated: true })); // ToDo isGenerated refactoring
    }
  };

  const handleLocatorClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const keyForMultiSelect = isMacPlatform(window) ? event.metaKey : event.ctrlKey;
    if (keyForMultiSelect) {
      if (active) dispatch(elementUnsetActive(element_id));
      else dispatch(elementSetActive(element));
    } else {
      if (!active) dispatch(setActiveSingle(element));
    }
  };

  const handleLocatorRightClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    if (!active) {
      dispatch(elementGroupUnsetActive(actualSelected));
      dispatch(setActiveSingle(element));
    }
  };

  const renderColorizedString = () => {
    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
      if (event.detail === 2) setIsEditModalOpen(true);
    };

    // ToDo: make clean, fix DRY (check locatorOutput.tsx)
    const vividusString = () => {
      return (
        <>
          <span>{getLocatorTemplateWithVividus(pageObjectName, locatorType, element)}</span>(
          <span className="jdn__locator__output-string">{locatorValue.output}</span>)
          <br />
        </>
      );
    };

    return (
      <span onClick={handleClick}>
        {isVividusFramework
          ? vividusString()
          : renderColorizedJdiString(annotationType, locatorType, locatorValue.output ?? '', type, name)}
      </span>
    );
  };

  return (
    <>
      <div
        ref={ref}
        className="jdn__xpath_container"
        onClick={handleLocatorClick}
        onContextMenu={handleLocatorRightClick}
      >
        {isLocatorListPage(currentPage) ? (
          <LocatorMenu {...{ setIsEditModalOpen, trigger: ['contextMenu'] }}>
            <div className="jdn__xpath_locators">
              <div
                ref={addToPORef as React.LegacyRef<HTMLDivElement>}
                onContextMenu={(e) => e.stopPropagation()}
                className="jdn__xpath_checkbox_wrapper"
              >
                <Checkbox
                  checked={isChecked}
                  indeterminate={indeterminate}
                  onClick={handleOnChange}
                  disabled={searchState === SearchState.Hidden}
                />
              </div>
              <Text
                className={`jdn__xpath_item${deleted ? ' jdn__xpath_item--deleted' : ''}${
                  searchState === SearchState.Hidden ? ' jdn__xpath_item--disabled' : ''
                }`}
              >
                <LocatorIcon {...{ message: elementMessage, locatorValue, deleted, isCustomLocator }} />
                {renderColorizedString()}
              </Text>
              {searchState !== SearchState.Hidden ? (
                <div onContextMenu={handleLocatorRightClick} className="jdn__xpath_buttons">
                  <LocatorCopyButton {...{ framework, element }} />
                  <OnboardingTooltip>
                    <LocatorMenu {...{ setIsEditModalOpen, trigger: ['click', 'contextMenu'] }}>
                      <Button
                        ref={menuRef}
                        className="jdn__itemsList-button jdn__locatorsList_button-menu"
                        icon={<DotsThree size={18} onClick={(e) => e.preventDefault()} />}
                      />
                    </LocatorMenu>
                  </OnboardingTooltip>
                </div>
              ) : null}
            </div>
          </LocatorMenu>
        ) : (
          <Text className="jdn__xpath_item">{renderColorizedString()}</Text>
        )}
      </div>
      {isEditModalOpen ? (
        <LocatorEditDialog {...element} isModalOpen={isEditModalOpen} setIsModalOpen={setIsEditModalOpen} />
      ) : null}
    </>
  );
};
