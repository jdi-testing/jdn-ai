import { Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
import React, { useRef, useEffect, useState } from "react";
import Text from "antd/lib/typography/Text";

import { pageType } from "../../../utils/constants";
import {
  toggleElementGeneration,
  setChildrenGeneration,
} from "../../../store/slices/locatorsSlice";
import { isLocatorIndeterminate, areChildrenChecked } from "../../../store/selectors/locatorSelectors";

import { LocatorIcon } from "./LocatorIcon";
import { LocatorCopyButton } from "./LocatorCopyButton";
import { LocatorMenu } from "./LocatorMenu";
import { ElementLibrary } from "../../PageObjects/utils/generationClassesMap";
import { LocatorEditDialog } from "./LocatoEditDialog";
import { PageType } from "../../../store/slices/mainSlice.types";
import { Locator as LocatorInterface } from "../../../store/slices/locatorSlice.types";
import { RootState } from "../../../store/store";
import { getLocator, setIndents } from "./utils";
import { SearchState } from "../LocatorsTree/LocatorsTree";

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
export const Locator: React.FC<Props> = ({
  element,
  currentPage,
  library,
  searchState,
  depth,
  searchString,
}) => {
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
        dispatch(setChildrenGeneration({ locator: element, generate: false }));
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
