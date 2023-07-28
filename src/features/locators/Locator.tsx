import { Checkbox, Button } from "antd";
import { DotsThree } from "phosphor-react";
import Text from "antd/lib/typography/Text";
import React, { useContext, useEffect, useRef, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";

import { areChildrenChecked, isLocatorIndeterminate } from "./selectors/locators.selectors";
import { isMacPlatform } from "../../common/utils/helpers";
import {
  elementSetActive,
  elementUnsetActive,
  elementGroupUnsetActive,
  setActiveSingle,
  setChildrenGeneration,
  toggleElementGeneration,
} from "./locators.slice";

import { size } from "lodash";
import { PageType } from "../../app/types/mainSlice.types";
import { RootState } from "../../app/store/store";
import { Locator as LocatorInterface } from "./types/locator.types";
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
import { AnnotationType, LocatorType } from "../../common/types/common";
import { getLocatorPrefix } from "./utils/locatorOutput";
import { ScriptMsg } from "../../pageServices/scriptMsg.constants";

interface Props {
  element: LocatorInterface;
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

  const { element_id, type, name, locator, generate, message, deleted, active, isCustomLocator } = element;

  const pageObjectAnnotationType = useSelector(selectCurrentPageObject)?.annotationType;
  const pageObjectLocatorType = useSelector(selectCurrentPageObject)?.locatorType;

  const annotationType = element?.annotationType || pageObjectAnnotationType || AnnotationType.UI;
  const locatorType = element?.locatorType || pageObjectLocatorType || LocatorType.xPath;

  const ref = useRef<HTMLDivElement>(null);

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
  const calculatedActive: LocatorInterface[] = useSelector(selectCalculatedActiveByPageObj);
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

  const handleOnChange: React.MouseEventHandler<HTMLDivElement> = (evt) => {
    evt.stopPropagation();
    dispatch(toggleElementGeneration(element_id));
    if (allChildrenChecked && size(element.children)) {
      dispatch(setChildrenGeneration({ locator: element, generate: false }));
    } else {
      dispatch(setChildrenGeneration({ locator: element, generate: true }));
    }
  };

  const handleLocatorClick: React.MouseEventHandler<HTMLDivElement> = (evt) => {
    const keyForMultiSelect = isMacPlatform(window) ? evt.metaKey : evt.ctrlKey;
    if (keyForMultiSelect) {
      if (active) dispatch(elementUnsetActive(element_id));
      else dispatch(elementSetActive(element));
    } else dispatch(setActiveSingle(element));
  };

  const handleLocatorRightClick: React.MouseEventHandler<HTMLDivElement> = (evt) => {
    evt.stopPropagation();
    if (!active) {
      dispatch(elementGroupUnsetActive(actualSelected));
      dispatch(setActiveSingle(element));
    }
  };

  const renderColorizedString = () => {
    const handleClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
      event.stopPropagation();
      if (event.detail === 2) {
        setIsEditModalOpen(true);
        clearTimeout(timer);
      } else {
        timer = setTimeout(() => {
          handleLocatorClick(event);
        }, 200);
      }
    };

    return (
      <span onClick={handleClick}>
        {annotationType}({getLocatorPrefix(annotationType, locatorType)}
        <span className="jdn__xpath_item-locator">&quot;{locator.output}&quot;</span>)
        <br />
        <span className="jdn__xpath_item-type">public</span>
        <span>&nbsp;{type as string}&nbsp;</span>
        {name};
      </span>
    );
  };

  return (
    <React.Fragment>
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
                  checked={generate}
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
                  <LocatorCopyButton {...{ element }} />
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
    </React.Fragment>
  );
};
