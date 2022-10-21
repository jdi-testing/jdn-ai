import { Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
import React, { memo, useRef, useEffect, useState } from "react";
import Text from "antd/lib/typography/Text";

import { pageType } from "../../../utils/constants";
import {
  toggleElementGeneration,
  setChildrenGeneration,
  setScrollToLocator,
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
import { getLocator } from "./utils";
import { size } from "lodash";

let timer: NodeJS.Timeout;

interface Props {
  element: LocatorInterface;
  currentPage: PageType;
  scroll: any;
  library: ElementLibrary;
}

// eslint-disable-next-line react/display-name
export const Locator: React.FC<Props> = memo(({ element, currentPage, scroll, library }) => {
  const dispatch = useDispatch();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);

  const { element_id, type, name, locator, generate, validity, deleted, jdnHash } = element;

  const ref = useRef<HTMLDivElement>(null);

  const indeterminate = useSelector((state: RootState) => isLocatorIndeterminate(state, element_id));
  const allChildrenChecked = useSelector((state: RootState) => areChildrenChecked(state, element_id));
  const scriptMessage = useSelector((_state: RootState) => _state.main.scriptMessage);

  const scrollToLocator = () => {
    if (scroll && generate && ref.current) {
      ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
      timer = setTimeout(() => dispatch(setScrollToLocator(null)), 0);
    }
  };

  scrollToLocator();

  useEffect(() => {
    scrollToLocator();
    return () => clearTimeout(timer);
  }, []);

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
    <div ref={ref} data-id={element_id} className="jdn__xpath_container">
      {currentPage === pageType.locatorsList ? (
        <div className="jdn__xpath_locators">
          <Checkbox checked={generate} indeterminate={indeterminate} onClick={handleOnChange}></Checkbox>
          <Text className={`jdn__xpath_item${deleted ? " jdn__xpath_item--deleted" : ""}`}>
            <LocatorIcon {...{ validity, locator, deleted }} />
            {renderColorizedString()}
          </Text>
          <LocatorCopyButton {...{ element }} />
          <LocatorMenu {...{ element, setIsEditModalOpen }} />
        </div>
      ) : (
        <Text className="jdn__xpath_item">{renderColorizedString()}</Text>
      )}
      {isEditModalOpen ? (
        <LocatorEditDialog
          {...{ element_id, type, name, locator, library, jdnHash, validity }}
          isModalOpen={isEditModalOpen}
          setIsModalOpen={setIsEditModalOpen}
        />
      ) : null}
    </div>
  );
});
