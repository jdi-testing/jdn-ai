import { Checkbox } from "antd";
import Text from "antd/lib/typography/Text";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { pageType } from "../../../common/constants/constants";
import { areChildrenChecked, isLocatorIndeterminate } from "../locatorSelectors";
import { setChildrenGeneration, toggleElementGeneration } from "../locatorsSlice";

import { size } from "lodash";
import { PageType } from "../../../app/mainSlice.types";
import { RootState } from "../../../app/store";
import { ElementLibrary } from "../../pageObjects/utils/generationClassesMap";
import { Locator as LocatorInterface } from "../locatorSlice.types";
import { SearchState } from "../locatorsTree/LocatorsTree";
import { LocatorEditDialog } from "./LocatoEditDialog";
import { LocatorCopyButton } from "./LocatorCopyButton";
import { LocatorIcon } from "./LocatorIcon";
import { LocatorMenu } from "./LocatorMenu";
import { getLocator, setIndents } from "./utils";

interface Props {
  element: LocatorInterface;
  currentPage: PageType;
  library: ElementLibrary;
  disabled?: boolean;
  searchState?: SearchState;
  depth?: number;
  searchString: string;
}

// eslint-disable-next-line react/display-name
export const Locator: React.FC<Props> = ({ element, currentPage, library, searchState, depth, searchString }) => {
  const dispatch = useDispatch();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { element_id, type, name, locator, generate, validity, deleted } = element;

  const ref = useRef<HTMLDivElement>(null);

  const indeterminate = useSelector((state: RootState) => isLocatorIndeterminate(state, element_id));
  const allChildrenChecked = useSelector((state: RootState) => areChildrenChecked(state, element_id));
  const scriptMessage = useSelector((_state: RootState) => _state.main.scriptMessage);

  useEffect(() => {
    ref && depth && setIndents(ref, depth);
  }, [searchString]);

  useEffect(() => {
    const message = scriptMessage?.message;
    const param = scriptMessage?.param;

    switch (message) {
      case "OPEN_EDIT_LOCATOR_REQUEST":
        if (param?.value.element_id !== element_id) return;
        setIsEditModalOpen(true);
        break;
    }
  }, [scriptMessage]);

  const handleOnChange = () => {
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

  const renderColorizedString = () => {
    const handleClick: React.MouseEventHandler<HTMLSpanElement> = (event) => {
      if (event.detail === 2) {
        setIsEditModalOpen(true);
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
        {name}
      </span>
    );
  };

  return (
    <div ref={ref} className="jdn__xpath_container">
      {currentPage === pageType.locatorsList ? (
        <div className="jdn__xpath_locators">
          <Checkbox
            checked={generate}
            indeterminate={indeterminate}
            onClick={handleOnChange}
            disabled={searchState === SearchState.Hidden}
          ></Checkbox>
          <Text
            className={`jdn__xpath_item${deleted ? " jdn__xpath_item--deleted" : ""}${
              searchState === SearchState.Hidden ? " jdn__xpath_item--disabled" : ""
            }`}
          >
            <LocatorIcon {...{ validity, locator, deleted }} />
            {renderColorizedString()}
          </Text>
          {searchState !== SearchState.Hidden ? (
            <React.Fragment>
              <LocatorCopyButton {...{ element }} />
              <LocatorMenu {...{ element, setIsEditModalOpen }} />
            </React.Fragment>
          ) : null}
        </div>
      ) : (
        <Text className="jdn__xpath_item">{renderColorizedString()}</Text>
      )}
      {isEditModalOpen ? (
        <LocatorEditDialog
          {...{ library }}
          {...element}
          isModalOpen={isEditModalOpen}
          setIsModalOpen={setIsEditModalOpen}
        />
      ) : null}
    </div>
  );
};
