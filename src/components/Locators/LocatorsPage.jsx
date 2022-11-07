import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Button, Modal, Tooltip } from "antd";

import { LocatorsTree } from "./LocatorsTree";
import { showOverlay, removeOverlay } from "../../services/pageDataHandlers";
import {
  selectCurrentPageObject,
  selectDeletedSelectedByPageObj,
  selectGeneratedSelectedByPageObj,
  selectWaitingSelectedByPageObj,
} from "../../store/selectors/pageObjectSelectors";
import { isEqual, size } from "lodash";

import { selectLocatorsByPageObject } from "../../store/selectors/pageObjectSelectors";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { pageType } from "../../utils/constants";
import { locatorGenerationController } from "../../services/locatorGenerationController";
import { clearLocators } from "../../store/slices/pageObjectSlice";
import { changePageBack, setScriptMessage } from "../../store/slices/mainSlice";
import { removeLocators, restoreLocators } from "../../store/slices/locatorsSlice";
import { LocatorListHeader } from "./LocatorListHeader";
import { Breadcrumbs } from "../common/Breadcrumbs";
import { customConfirm } from "../common/CustomConfirm";

const { confirm } = Modal;

export const LocatorsPage = ({ alreadyGenerated }) => {
  const dispatch = useDispatch();
  const currentPageObject = useSelector((_state) => _state.pageObject.present.currentPageObject);
  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector((_state) => selectLocatorsByPageObject(_state, currentPageObject));
  const locatorIds = useSelector(selectCurrentPageObject).locators;
  const waitingSelected = useSelector((_state) => selectWaitingSelectedByPageObj(_state, currentPageObject));
  const generatedSelected = useSelector((_state) => selectGeneratedSelectedByPageObj(_state, currentPageObject));
  const deletedSelected = useSelector((_state) => selectDeletedSelectedByPageObj(_state, currentPageObject));

  const [locatorsSnapshot] = useState(locators);

  const pageBack = () => {
    dispatch(setScriptMessage({}));
    dispatch(changePageBack());
  };

  const handleConfirm = () => {
    if (size(waitingSelected)) {
      confirm({
        title: "Сonfirm the selection",
        content: `Attention! Not all of the selected locators have already been generated. 
          We recommend to wait until the generation is completed.`,
        okText: "Confirm selection",
        cancelText: "Cancel",
        onOk: () => {
          locatorGenerationController.revokeAll();
          pageBack();
        },
      });
    } else if (size(deletedSelected)) {
      confirm({
        title: "Сonfirm the selection",
        content: `Not all selected locators will be generated.
        You can cancel the generation and restore the required locators first.`,
        okText: "Confirm",
        onOk: () => pageBack(),
      });
    } else pageBack();
  };

  useEffect(() => {
    if (alreadyGenerated) {
      showOverlay();
    }
    return () => {
      removeOverlay();
    };
  }, []);

  const renderBackButton = () => {
    const handleBack = () => {
      if (isEqual(locators, locatorsSnapshot)) pageBack();
      else {
        const enableOk = size(waitingSelected) || size(generatedSelected);
        customConfirm({
          onAlt: handleDiscard,
          altText: "Discard",
          onOk: handleOk,
          enableOk,
          confirmTitle: "You have unsaved changes",
          confirmContent: "The list has been edited and the changes have not been accepted, do you want to save them?",
        });
      }
    };

    const handleOk = () => {
      pageBack();
    };

    const handleDiscard = () => {
      locatorGenerationController.revokeAll();
      if (!size(locatorsSnapshot)) {
        dispatch(removeLocators(locatorIds));
        dispatch(clearLocators());
      } else {
        dispatch(restoreLocators(locatorsSnapshot));
      }
      pageBack();
    };

    return (
      <React.Fragment>
        {currentPage === pageType.locatorsList ? (
          <Button onClick={handleBack} className="jdn__buttons">
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
              Save
            </Button>
          </Tooltip>
        </React.Fragment>
      );
    } else return null;
  };

  return (
    <React.Fragment>
      <div className="jdn__locatorsList">
        <Breadcrumbs />
        <LocatorListHeader
          {...{
            locatorIds,
            generatedSelected,
            waitingSelected,
            deletedSelected,
          }}
          render={(viewProps) => (
            <div className="jdn__locatorsList-content">
              {size(locators) ? <LocatorsTree pageObject={currentPageObject} {...{ viewProps, locatorIds }} /> : null}
            </div>
          )}
        />
      </div>
      <div className="jdn__navigation">
        {renderBackButton()}
        {renderConfirmButton()}
      </div>
    </React.Fragment>
  );
};
