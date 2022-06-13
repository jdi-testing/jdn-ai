import { Checkbox } from "antd";
import { useDispatch, useSelector } from "react-redux";
import React, { memo, useRef } from "react";
import Text from "antd/lib/typography/Text";

import { getLocator } from "../../../services/pageObject";
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

// eslint-disable-next-line react/display-name
export const Locator = memo(({ element, currentPage, scroll, library }) => {
  const dispatch = useDispatch();

  const { element_id, type, name, locator, generate, validity, deleted } = element;

  const ref = useRef(null);

  const indeterminate = useSelector((state) => isLocatorIndeterminate(state, element_id));
  const allChildrenChecked = useSelector((state) => areChildrenChecked(state, element_id));

  if (scroll && generate) {
    ref.current.scrollIntoView({ behavior: "smooth", block: "center" });
    dispatch(setScrollToLocator(null));
  }

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
    return (
      <span>
        @UI(
        <span className="jdn__xpath_item-locator">&quot;{getLocator(locator)}&quot;</span>)
        <br />
        <span className="jdn__xpath_item-type">public</span>
        <span>&nbsp;{type}&nbsp;</span>
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
          <LocatorMenu {...{ element, library }} />
        </div>
      ) : (
        <Text className="jdn__xpath_item">{renderColorizedString()}</Text>
      )}
    </div>
  );
});
