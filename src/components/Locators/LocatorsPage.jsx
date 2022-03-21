import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "antd";
import Icon from "@ant-design/icons";

import { LocatorsList } from "./LocatorsList";
import { PerceptionTreshold } from "../PerceptionTreshold/PerceptionTreshold";
import { openConfirmBackPopup, openConfirmInProgressPopup } from "../../services/pageDataHandlers";
import {
  selectGeneratedSelectedByPageObj,
  selectLocatorsToConfirm,
  selectWaitingSelectedByPageObj,
} from "../../store/selectors/pageObjectSelectors";
import { isEqual, size } from "lodash";

import CaretDownSvg from "../../assets/caret-down.svg";
import { selectLocatorsByPageObject } from "../../store/selectors/pageObjectSelectors";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { pageType } from "../../utils/constants";
import { locatorGenerationController } from "../../services/locatorGenerationController";
import { confirmLocators } from "../../store/slices/pageObjectSlice";
import { changePage } from "../../store/slices/mainSlice";

export const onConfirm = () => {};
export const onBack = (snapshot) => () => {
  console.log(snapshot);
  dispatch(changePageBack());
  dispatch(toggleBackdrop(false));
};

export const confirmSelectedLocators = (locatorsToConfirm) => (dispatch, currentPageObject) => {
  locatorGenerationController.revokeAll();

  dispatch(confirmLocators({ id: currentPageObject, locatorIds: locatorsToConfirm }));
  dispatch(changePage({ page: pageType.pageObject, pageObj: currentPageObject }));
};

export const LocatorsPage = () => {
  const dispatch = useDispatch();
  const currentPageObject = useSelector((_state) => _state.pageObject.currentPageObject);
  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector((_state) => selectLocatorsByPageObject(_state, currentPageObject));
  const waitingSelected = useSelector((_state) => selectWaitingSelectedByPageObj(_state, currentPageObject));
  const generatedSelected = useSelector((_state) => selectGeneratedSelectedByPageObj(_state, currentPageObject));
  const locatorsToConfirm = useSelector((_state) =>
    selectLocatorsToConfirm(_state, currentPageObject).map((loc) => loc.element_id)
  );

  const [locatorsSnapshot] = useState(locators);

  onBack(locatorsSnapshot);

  const handleConfirm = () => {
    // confirmSelectedLocators(locatorsToConfirm);

    if (size(waitingSelected)) {
      openConfirmInProgressPopup();
    } else {
      confirmSelectedLocators(locatorsToConfirm)(dispatch, currentPageObject);
    }
  };

  const handleBack = () => {
    if (isEqual(locators, locatorsSnapshot)) {
      console.log("equal");
      onBack();
    } else openConfirmBackPopup();
  };

  const renderBackButton = () => {
    return (
      <React.Fragment>
        {currentPage === pageType.locatorsList ? (
          <Button onClick={handleBack} className="jdn__buttons">
            <Icon component={CaretDownSvg} rotate={90} fill="#1582D8" />
            Back
          </Button>
        ) : null}
      </React.Fragment>
    );
  };

  const renderConfirmButton = () => {
    if (currentPage === pageType.locatorsList) {
      const isDisabled = !size(waitingSelected) && !size(generatedSelected);
      return (
        <React.Fragment>
          <Tooltip
            overlayClassName="jdn__button-tooltip"
            title={isDisabled ? "Please select locators for your current page object." : ""}
          >
            <Button type="primary" onClick={handleConfirm} className="jdn__buttons" disabled={isDisabled}>
              Confirm
              <Icon component={CaretDownSvg} rotate={270} fill="#ffffff" />
            </Button>
          </Tooltip>
        </React.Fragment>
      );
    } else return null;
  };

  return (
    <React.Fragment>
      <LocatorsList pageObject={currentPageObject} />
      <PerceptionTreshold />
      <div className="jdn__navigation">
        {renderBackButton()}
        {renderConfirmButton()}
      </div>
    </React.Fragment>
  );
};
