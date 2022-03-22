import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Tooltip } from "antd";
import Icon from "@ant-design/icons";

import { LocatorsList } from "./LocatorsList";
import { PerceptionTreshold } from "../PerceptionTreshold/PerceptionTreshold";
import { openConfirmBackPopup, openConfirmInProgressPopup } from "../../services/pageDataHandlers";
import {
  selectGeneratedSelectedByPageObj,
  selectPageObjById,
  selectWaitingSelectedByPageObj,
} from "../../store/selectors/pageObjectSelectors";
import { isEqual, size } from "lodash";

import CaretDownSvg from "../../assets/caret-down.svg";
import { selectLocatorsByPageObject } from "../../store/selectors/pageObjectSelectors";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { pageType } from "../../utils/constants";
import { locatorGenerationController } from "../../services/locatorGenerationController";
import { clearLocators } from "../../store/slices/pageObjectSlice";
import { changePageBack, setScriptMessage, toggleBackdrop } from "../../store/slices/mainSlice";
import { removeLocators, restoreLocators } from "../../store/slices/locatorsSlice";

export const LocatorsPage = () => {
  const dispatch = useDispatch();
  const currentPageObject = useSelector((_state) => _state.pageObject.currentPageObject);
  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector((_state) => selectLocatorsByPageObject(_state, currentPageObject));
  const locatorIds = useSelector((_state) => selectPageObjById(_state, currentPageObject).locators);
  const waitingSelected = useSelector((_state) => selectWaitingSelectedByPageObj(_state, currentPageObject));
  const generatedSelected = useSelector((_state) => selectGeneratedSelectedByPageObj(_state, currentPageObject));
  const scriptMessage = useSelector((_state) => _state.main.scriptMessage);

  const [locatorsSnapshot] = useState(locators);

  const pageBack = () => {
    dispatch(setScriptMessage({}));
    dispatch(changePageBack());
    dispatch(toggleBackdrop(false));
  };

  const handleBack = () => {
    if (isEqual(locators, locatorsSnapshot)) pageBack();
    else {
      const enableSave = size(waitingSelected) || size(generatedSelected);
      openConfirmBackPopup(enableSave);
    };
  };

  const handleConfirm = () => {
    if (size(waitingSelected)) openConfirmInProgressPopup();
    else pageBack();
  };

  useEffect(() => {
    const { message } = scriptMessage;
    switch (message) {
      case "CONFIRM_BACK_POPUP":
        locatorGenerationController.revokeAll();
        if (!size(locatorsSnapshot)) {
          dispatch(removeLocators(locatorIds));
          dispatch(clearLocators());
        } else {
          dispatch(restoreLocators(locatorsSnapshot));
        }
        pageBack();
        break;
      case "CONFIRM_SAVE_CHANGES":
        handleConfirm();
        break;
      case "CONFIRM_IN_PROGRESS_POPUP":
        locatorGenerationController.revokeAll();
        pageBack();
        break;
    }
  }, [scriptMessage]);

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
            <Button
              type="primary"
              onClick={handleConfirm}
              className="jdn__buttons"
              disabled={isDisabled}
            >
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
