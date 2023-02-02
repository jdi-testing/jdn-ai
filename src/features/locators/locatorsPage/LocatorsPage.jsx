import { Button, Modal, Tooltip, Row } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

import { isEqual, size } from "lodash";

import { selectCurrentPage } from "../../../app/mainSelectors";
import { changePageBack, setScriptMessage } from "../../../app/mainSlice";
import { Breadcrumbs } from "../../../common/components/Breadcrumbs/Breadcrumbs";
import { customConfirm } from "../../../common/components/CustomConfirm";
import { pageType } from "../../../common/constants/constants";
import { removeOverlay, showOverlay } from "../../../pageServices/pageDataHandlers";
import {
  selectCurrentPageObject,
  selectDeletedGenerateByPageObj,
  selectCalculatedGenerateByPageObj,
  selectInProgressGenerateByPageObj,
  selectFilteredLocators,
} from "../../pageObjects/pageObjectSelectors";
import { clearLocators } from "../../pageObjects/pageObjectSlice";
import { locatorGenerationController } from "../locatorGenerationController";
import { removeLocators, restoreLocators } from "../locatorsSlice";
import { LocatorsTree } from "../locatorsTree";
import { LocatorListHeader } from "./LocatorListHeader";
import { Filter } from "../../filter/Filter";

const { confirm } = Modal;

export const LocatorsPage = ({ alreadyGenerated }) => {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector(selectFilteredLocators);
  const locatorIds = useSelector(selectCurrentPageObject).locators;
  const inProgressGenerate = useSelector(selectInProgressGenerateByPageObj);
  const calculatedGenerate = useSelector(selectCalculatedGenerateByPageObj);
  const deletedGenerate = useSelector(selectDeletedGenerateByPageObj);

  const [locatorsSnapshot] = useState(locators);

  const pageBack = () => {
    dispatch(setScriptMessage({}));
    dispatch(changePageBack());
  };

  const handleConfirm = () => {
    if (size(inProgressGenerate)) {
      confirm({
        title: "Confirm this locators list",
        content: `Not all of the selected locators have already been generated, we recommend waiting until the generation is complete.`,
        okText: "Confirm selection",
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
        const enableOk = size(inProgressGenerate) || size(calculatedGenerate);
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
      const isDisabled = !size(inProgressGenerate) && !size(calculatedGenerate);
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
        <Row justify="space-between" wrap={false}>
          <Breadcrumbs />
          <Filter />
        </Row>
        <LocatorListHeader
          render={(viewProps) => (
            <div className="jdn__locatorsList-content">
              {size(locators) ? <LocatorsTree {...{ viewProps, locatorIds }} /> : null}
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
