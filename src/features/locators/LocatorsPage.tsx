import { Button, Modal, Tooltip, Row } from "antd";
import React, { useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { isEqual, size } from "lodash";

import { selectCurrentPage } from "../../app/main.selectors";
import { changePageBack, setScriptMessage } from "../../app/main.slice";
import { Breadcrumbs } from "../../common/components/breadcrumbs/Breadcrumbs";
import { customConfirm } from "../../common/components/CustomConfirm";
import { pageType } from "../../common/constants/constants";
import {
  selectDeletedGenerateByPageObj,
  selectCalculatedGenerateByPageObj,
  selectInProgressGenerateByPageObj,
  selectFilteredLocators,
  getLocatorsIdsByPO,
  selectCheckedLocators,
  selectLocatorsByPageObject,
} from "../pageObjects/pageObject.selectors";
import { clearLocators } from "../pageObjects/pageObject.slice";
import { locatorGenerationController } from "./utils/locatorGenerationController";
import { removeLocators, restoreLocators } from "./locators.slice";
import { LocatorsTree, LocatorTreeProps } from "./components/LocatorsTree";
import { LocatorListHeader } from "./components/LocatorListHeader";
import { Filter } from "../filter/Filter";
import { useCalculateHeaderSize } from "./utils/useCalculateHeaderSize";
import { RootState } from "../../app/store/store";
import { IdentificationStatus } from "./types/locator.types";
import { LocatorTreeSpinner } from "./components/LocatorTreeSpinner";
import { removeAll as removeAllFilters, setFilter } from "../filter/filter.slice";
import { selectIfUnselectedAll } from "../filter/filter.selectors";
import { selectClassFilterByPO } from "../filter/filter.selectors";

const { confirm } = Modal;

export const LocatorsPage = () => {
  const dispatch = useDispatch();
  const showSpinner = useSelector(
    (state: RootState) => state.locators.present.status === IdentificationStatus.preparing
  );
  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector(selectFilteredLocators);
  const areUnselectedAll = useSelector(selectIfUnselectedAll);
  const locatorIds = useSelector(getLocatorsIdsByPO);
  const inProgressGenerate = useSelector(selectInProgressGenerateByPageObj);
  const calculatedGenerate = useSelector(selectCalculatedGenerateByPageObj);
  const deletedGenerate = useSelector(selectDeletedGenerateByPageObj);
  const currentPOId = useSelector((state: RootState) => state.pageObject.present.currentPageObject);

  const breadcrumbsRef = useRef(null);
  const [locatorsSnapshot] = useState(useSelector(selectLocatorsByPageObject));
  const [filterSnapshot] = useState(useSelector(selectClassFilterByPO));
  // For changing locatorsList-content height depends on header height
  const containerHeight = useCalculateHeaderSize(breadcrumbsRef);

  const pageBack = () => {
    dispatch(setScriptMessage({}));
    dispatch(changePageBack());
  };

  const handleConfirm = () => {
    if (size(inProgressGenerate)) {
      confirm({
        title: "Confirm this locators list",
        content: `Not all of the selected locators have already been generated, we recommend waiting until the generation is complete.`,
        okText: "Confirm",
        cancelText: "Cancel",
        onOk: () => {
          locatorGenerationController.revokeAll();
          pageBack();
        },
      });
    } else if (size(deletedGenerate)) {
      confirm({
        title: "Confirm the selection",
        content: `Not all selected locators will be generated.
        You can cancel the generation and restore the required locators first.`,
        okText: "Confirm",
        onOk: () => pageBack(),
      });
    } else pageBack();
  };

  const renderBackButton = () => {
    const handleBack = () => {
      if (isEqual(locators, locatorsSnapshot)) pageBack();
      else {
        const enableOk = !!(size(inProgressGenerate) || size(calculatedGenerate));
        customConfirm({
          onAlt: handleDiscard,
          altText: "Discard",
          onOk: handleOk,
          enableOk,
          confirmTitle: "Save this locators list?",
          confirmContent:
            "The list has been edited and the changes have not been accepted. Do you want to save changes?",
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
        dispatch(clearLocators(undefined));
        dispatch(removeAllFilters());
      } else {
        dispatch(restoreLocators(locatorsSnapshot));
        dispatch(setFilter({ pageObjectId: currentPOId!, JDIclassFilter: filterSnapshot }));
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
      const checkedLocators = useSelector(selectCheckedLocators);
      const isDisabled = !size(inProgressGenerate) && !size(calculatedGenerate);
      return (
        <React.Fragment>
          <Tooltip
            overlayClassName="jdn__button-tooltip"
            title={isDisabled ? "Please select locators for your current page object." : ""}
          >
            <Button type="primary" onClick={handleConfirm} className="jdn__buttons" disabled={isDisabled}>
              {!size(checkedLocators)
                ? "Save"
                : size(checkedLocators) > 1
                ? `Save ${size(checkedLocators)} locators`
                : "Save 1 locator"}
            </Button>
          </Tooltip>
        </React.Fragment>
      );
    } else return null;
  };

  return (
    <React.Fragment>
      <div className="jdn__locatorsList">
        <Row justify="space-between" wrap={false}>
          <Breadcrumbs ref={breadcrumbsRef} />
          <Filter />
        </Row>
        <LocatorListHeader
          render={(viewProps: LocatorTreeProps["viewProps"]) => (
            <div className="jdn__locatorsList-content" style={{ height: containerHeight }}>
              {size(locators) || areUnselectedAll ? (
                <LocatorsTree {...{ viewProps, locatorIds }} />
              ) : showSpinner ? (
                <LocatorTreeSpinner />
              ) : null}
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
