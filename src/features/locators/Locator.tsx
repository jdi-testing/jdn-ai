import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { Checkbox, Button } from "antd";
import { DotsThree } from "@phosphor-icons/react";
import Text from "antd/lib/typography/Text";
import { useDispatch, useSelector } from "react-redux";

import { areChildrenChecked, isLocatorIndeterminate } from "./selectors/locators.selectors";
import { isMacPlatform } from "../../common/utils/helpers";
import {
  elementSetActive,
  elementUnsetActive,
  elementGroupUnsetActive,
  setActiveSingle,
  toggleLocatorIsChecked,
  setChildrenIsChecked,
} from "./locators.slice";

import { size } from "lodash";
import { PageType } from "../../app/types/mainSlice.types";
import { RootState } from "../../app/store/store";
import { ILocator } from "./types/locator.types";
import { SearchState } from "./components/LocatorsTree";
import { LocatorEditDialog } from "./components/LocatorEditDialog";
import { LocatorCopyButton } from "./components/LocatorCopyButton";
import { LocatorIcon } from "./components/LocatorIcon";
import { LocatorMenu } from "./components/LocatorMenu";
import { setIndents } from "./utils/utils";
import { setScriptMessage } from "../../app/main.slice";
import { useOnBoardingRef } from "../onboarding/utils/useOnboardingRef";
import { OnbrdStep } from "../onboarding/types/constants";
import { OnbrdTooltip } from "../onboarding/components/OnbrdTooltip";
import { OnboardingContext } from "../onboarding/OnboardingProvider";
import { selectFirstLocatorIdByPO } from "./selectors/locatorsByPO.selectors";
import { selectCalculatedActiveByPageObj, selectWaitingActiveByPageObj } from "./selectors/locatorsFiltered.selectors";
import { isLocatorListPage } from "../../app/utils/heplers";
import { selectCurrentPageObject } from "../pageObjects/selectors/pageObjects.selectors";
import { AnnotationType, FrameworkType, LocatorType } from "../../common/types/common";
import { getLocatorPrefix, getLocatorTemplateWithVividus } from "./utils/locatorOutput";
import { ScriptMsg } from "../../pageServices/scriptMsg.constants";

interface Props {
  element: ILocator;
  currentPage: PageType;
  disabled?: boolean;
  searchState?: SearchState;
  depth?: number;
  searchString?: string;
}

// eslint-disable-next-line react/display-name
export const Locator: React.FC<Props> = ({ element, currentPage, searchState, depth, searchString }) => {
  const dispatch = useDispatch();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const { isCustomLocatorFlow } = useContext(OnboardingContext);

  const { element_id, type, name, locator, message, deleted, active, isCustomLocator, isChecked } = element;

  const currentPageObject = useSelector(selectCurrentPageObject);

  if (!currentPageObject) return null;

  const {
    name: pageObjectName,
    framework,
    annotationType: pageObjectAnnotationType,
    locatorType: pageObjectLocatorType,
  } = currentPageObject;

  const annotationType = element?.annotationType || pageObjectAnnotationType || AnnotationType.UI;
  const locatorType = element?.locatorType || pageObjectLocatorType || LocatorType.xPath;

  const ref = useRef<HTMLDivElement>(null);

  const isVividusFramework = framework === FrameworkType.Vividus;

  const isFirstLocator = useSelector(selectFirstLocatorIdByPO) === element_id;
  const menuRef = useOnBoardingRef(
    OnbrdStep.EditLocator,
    undefined,
    undefined,
    !(isFirstLocator && !isCustomLocatorFlow)
  );
  const addToPORef = useOnBoardingRef(OnbrdStep.AddToPO, undefined, undefined, !isFirstLocator);

  const indeterminate = useSelector((state: RootState) => isLocatorIndeterminate(state, element_id));
  const allChildrenChecked = useSelector((state: RootState) => areChildrenChecked(state, element_id));
  const scriptMessage = useSelector((_state: RootState) => _state.main.scriptMessage);
  const calculatedActive: ILocator[] = useSelector(selectCalculatedActiveByPageObj);
  const waitingActive = useSelector(selectWaitingActiveByPageObj);
  const actualSelected = useMemo(() => [...calculatedActive, ...waitingActive], [calculatedActive, waitingActive]);

  let timer: NodeJS.Timeout;
  useEffect(() => clearTimeout(timer), []);

  useEffect(() => {
    ref && depth && setIndents(ref, depth);
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

  const handleOnChange: React.MouseEventHandler<HTMLDivElement> = () => {
    dispatch(toggleLocatorIsChecked(element_id));
    if (allChildrenChecked && size(element.children)) {
      dispatch(setChildrenIsChecked({ locator: element, isChecked: false }));
    } else {
      dispatch(setChildrenIsChecked({ locator: element, isChecked: true }));
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

    const jdiString = () => {
      return (
        <>
          <span>
            {annotationType}({getLocatorPrefix(annotationType, locatorType)}
          </span>
          <span className="jdn__xpath_item-locator">&quot;{locator.output}&quot;</span>)
          <br />
          <span className="jdn__xpath_item-type">public</span>
          <span>&nbsp;{type}&nbsp;</span>
          {name}
        </>
      );
    };

    const vividusString = () => {
      return (
        <>
          <span>{getLocatorTemplateWithVividus(pageObjectName, locatorType, element)}</span>(
          <span className="jdn__xpath_item-locator">{locator.output}</span>)
          <br />
        </>
      );
    };

    return <span onClick={handleClick}>{isVividusFramework ? vividusString() : jdiString()}</span>;
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
          <LocatorMenu {...{ setIsEditModalOpen, trigger: ["contextMenu"] }}>
            <div className="jdn__xpath_locators">
              <div ref={addToPORef} onContextMenu={(e) => e.stopPropagation()} className="jdn__xpath_checkbox_wrapper">
                <Checkbox
                  checked={isChecked}
                  indeterminate={indeterminate}
                  onClick={handleOnChange}
                  disabled={searchState === SearchState.Hidden}
                />
              </div>
              <Text
                className={`jdn__xpath_item${deleted ? " jdn__xpath_item--deleted" : ""}${
                  searchState === SearchState.Hidden ? " jdn__xpath_item--disabled" : ""
                }`}
              >
                <LocatorIcon {...{ message, locator, deleted, isCustomLocator }} />
                {renderColorizedString()}
              </Text>
              {searchState !== SearchState.Hidden ? (
                <div onContextMenu={handleLocatorRightClick} className="jdn__xpath_buttons">
                  <LocatorCopyButton {...{ framework, element }} />
                  <OnbrdTooltip>
                    <LocatorMenu {...{ setIsEditModalOpen, trigger: ["click", "contextMenu"] }}>
                      <Button
                        ref={menuRef}
                        className="jdn__itemsList-button jdn__locatorsList_button-menu"
                        icon={<DotsThree size={18} onClick={(e) => e.preventDefault()} />}
                      />
                    </LocatorMenu>
                  </OnbrdTooltip>
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
