import { Checkbox, Button } from "antd";
import { DotsThree } from "phosphor-react";
import Text from "antd/lib/typography/Text";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { pageType } from "../../common/constants/constants";
import { areChildrenChecked, isLocatorIndeterminate } from "./locators.selectors";
import { isMacPlatform } from "../../common/utils/helpers";
import {
  elementSetActive,
  elementUnsetActive,
  setActiveSingle,
  setChildrenGeneration,
  toggleElementGeneration,
} from "./locators.slice";

import { size } from "lodash";
import { PageType } from "../../app/types/mainSlice.types";
import { RootState } from "../../app/store/store";
import { ElementLibrary } from "./types/generationClasses.types";
import { Locator as LocatorInterface } from "./types/locator.types";
import { SearchState } from "./components/LocatorsTree";
import { LocatorEditDialog } from "./components/LocatorEditDialog";
import { LocatorCopyButton } from "./components/LocatorCopyButton";
import { LocatorIcon } from "./components/LocatorIcon";
import { LocatorMenu } from "./components/LocatorMenu";
import { getLocator, setIndents } from "./utils/utils";
import { setScriptMessage } from "../../app/main.slice";

interface Props {
  element: LocatorInterface;
  currentPage: PageType;
  library: ElementLibrary;
  disabled?: boolean;
  searchState?: SearchState;
  depth?: number;
  searchString?: string;
}

// eslint-disable-next-line react/display-name
export const Locator: React.FC<Props> = ({ element, currentPage, library, searchState, depth, searchString }) => {
  const dispatch = useDispatch();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { element_id, type, name, locator, generate, validity, deleted, active } = element;

  const ref = useRef<HTMLDivElement>(null);

  const indeterminate = useSelector((state: RootState) => isLocatorIndeterminate(state, element_id));
  const allChildrenChecked = useSelector((state: RootState) => areChildrenChecked(state, element_id));
  const scriptMessage = useSelector((_state: RootState) => _state.main.scriptMessage);

  let timer: NodeJS.Timeout;
  useEffect(() => clearTimeout(timer), []);

  useEffect(() => {
    ref && depth && setIndents(ref, depth);
  }, [searchString]);

  useEffect(() => {
    const message = scriptMessage?.message;
    const param = scriptMessage?.param;

    switch (message) {
      case "OPEN_EDIT_LOCATOR":
        if (param?.value.element_id !== element_id) return;
        setIsEditModalOpen(true);
        dispatch(setScriptMessage({}));
        break;
    }
  }, [scriptMessage]);

  const handleOnChange: React.MouseEventHandler<HTMLDivElement> = (event) => {
    event.stopPropagation();
    if (!generate) {
      dispatch(toggleElementGeneration(element_id));
    } else {
      if (allChildrenChecked) {
        dispatch(toggleElementGeneration(element_id));
        size(element.children) && dispatch(setChildrenGeneration({ locator: element, generate: false }));
      } else {
        dispatch(setChildrenGeneration({ locator: element, generate: true }));
      }
    }
  };

  const handleLocatorClick: React.MouseEventHandler<HTMLDivElement> = (event) => {
    const keyForMultiSelect = isMacPlatform(window) ? event.metaKey : event.ctrlKey;
    if (keyForMultiSelect) {
      if (active) dispatch(elementUnsetActive(element_id));
      else dispatch(elementSetActive(element_id));
    } else dispatch(setActiveSingle(element));
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
        @UI(
        {/* remove when getLocator() migrate to TS */}
        {/* eslint-disable-next-line */}
        {/* @ts-ignore */}
        <span className="jdn__xpath_item-locator">&quot;{getLocator(locator)}&quot;</span>)
        <br />
        <span className="jdn__xpath_item-type">public</span>
        <span>&nbsp;{type as string}&nbsp;</span>
        {name};
      </span>
    );
  };

  return (
    <React.Fragment>
      <LocatorMenu {...{ element, setIsEditModalOpen, trigger: ["contextMenu"] }}>
        <div ref={ref} className="jdn__xpath_container" onClick={handleLocatorClick}>
          {currentPage === pageType.locatorsList ? (
            <div className="jdn__xpath_locators">
              <div onContextMenu={(e) => e.stopPropagation()} className="jdn__xpath_checkbox_wrapper">
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
                <LocatorIcon {...{ validity, locator, deleted }} />
                {renderColorizedString()}
              </Text>
              {searchState !== SearchState.Hidden ? (
                <div onContextMenu={(e) => e.stopPropagation()} className="jdn__xpath_buttons">
                  <LocatorCopyButton {...{ element }} />
                  <LocatorMenu {...{ element, setIsEditModalOpen, trigger: ["click", "contextMenu"] }}>
                    <Button
                      className="jdn__locatorsList_button jdn__locatorsList_button-menu"
                      icon={<DotsThree size={18} onClick={(e) => e.preventDefault()} />}
                    />
                  </LocatorMenu>
                </div>
              ) : null}
            </div>
          ) : (
            <Text className="jdn__xpath_item">{renderColorizedString()}</Text>
          )}
        </div>
      </LocatorMenu>
      {isEditModalOpen ? (
        <LocatorEditDialog
          {...{ library }}
          {...element}
          isModalOpen={isEditModalOpen}
          setIsModalOpen={setIsEditModalOpen}
        />
      ) : null}
    </React.Fragment>
  );
};
