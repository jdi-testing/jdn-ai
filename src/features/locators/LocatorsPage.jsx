import { Button, Modal, Tooltip, Row } from "antd";
import React, { useEffect, useState, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import { isEqual, size } from "lodash";

import { selectCurrentPage } from "../../app/main.selectors";
import { changePageBack, setScriptMessage } from "../../app/main.slice";
import { Breadcrumbs } from "../../common/components/breadcrumbs/Breadcrumbs";
import { customConfirm } from "../../common/components/CustomConfirm";
import { pageType } from "../../common/constants/constants";
import { removeOverlay, showOverlay } from "../../pageServices/pageDataHandlers";
import {
  selectCurrentPageObject,
  selectDeletedGenerateByPageObj,
  selectCalculatedGenerateByPageObj,
  selectInProgressGenerateByPageObj,
  selectFilteredLocators,
} from "../pageObjects/pageObject.selectors";
import { clearLocators } from "../pageObjects/pageObject.slice";
import { locatorGenerationController } from "../locators/utils/locatorGenerationController";
import { removeLocators, restoreLocators } from "./locators.slice";
import { LocatorsTree } from "./components/LocatorsTree";
import { LocatorListHeader } from "./components/LocatorListHeader";
import { Filter } from "../filter/Filter";

const { confirm } = Modal;

export const LocatorsPage = ({ alreadyGenerated }) => {
  const dispatch = useDispatch();
  const currentPage = useSelector(selectCurrentPage).page;
  const locators = useSelector(selectFilteredLocators);
  const locatorIds = useSelector(selectCurrentPageObject).locators;
  const inProgressGenerate = useSelector(selectInProgressGenerateByPageObj);
  const calculatedGenerate = useSelector(selectCalculatedGenerateByPageObj);
  const deletedGenerate = useSelector(selectDeletedGenerateByPageObj);

  const breadcrumbsRef = useRef(null);
  const [locatorsListHeight, setLocatorListHeight] = useState();
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

  useEffect(() => {
    if (alreadyGenerated) {
      showOverlay();
    }
    return () => {
      removeOverlay();
    };
  }, []);

  // For changing locatorsList-content height depends on header height
  useEffect(() => {
    if (!breadcrumbsRef.current) return;
    const PLUGIN_HEADER_HEIGHT = 169;
    let breadcrumbsHeight = breadcrumbsRef?.current?.clientHeight;
    setLocatorListHeight(window.innerHeight - PLUGIN_HEADER_HEIGHT - breadcrumbsHeight);

    const resizeObserver = new ResizeObserver(() => {
      // Do what you want to do when the size of the element changes
      breadcrumbsHeight = breadcrumbsRef?.current?.clientHeight;
      setLocatorListHeight(window.innerHeight - PLUGIN_HEADER_HEIGHT - breadcrumbsHeight);
    });

    resizeObserver.observe(breadcrumbsRef.current);
    return () => resizeObserver.disconnect();
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
          <Breadcrumbs ref={breadcrumbsRef} />
          <Filter />
        </Row>
        <LocatorListHeader
          render={(viewProps) => (
            <div className="jdn__locatorsList-content" style={{ height: `${locatorsListHeight}px` }}>
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
