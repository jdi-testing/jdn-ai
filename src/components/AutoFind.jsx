import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Button, Tooltip } from "antd";
import Icon from "@ant-design/icons";

import { changePage, clearAll } from "../store/slices/mainSlice";
import { connector } from "../services/connector";
import { ControlBar } from "./ControlBar";
import { createListeners } from "../services/scriptListener";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { openConfirmBackPopup, openConfirmInProgressPopup, removeOverlay } from "../services/pageDataHandlers";
import { LocatorsPage } from "./Locators/LocatorsPage";
import { identificationStatus, pageType } from "../utils/constants";

import CaretDownSvg from "../assets/caret-down.svg";
import { selectCurrentPage } from "../store/selectors/mainSelectors";
import {
  selectGeneratedSelectedByPageObj,
  selectInProgressToConfirm,
  selectLocatorsToConfirm,
  selectWaitingSelectedByPageObj,
} from "../store/selectors/pageObjectSelectors";
import { size } from "lodash";
import { confirmLocators, removeEmptyPOs } from "../store/slices/pageObjectSlice";
import { PageObjectPage } from "./PageObjects/PageObjectPage";

const AutoFind = () => {
  const [isInvalidSession, setIsInvalidSession] = useState(localStorage.getItem("secondSession"));
  const state = useSelector((state) => state);
  const status = useSelector((state) => state.locators.status);
  const currentPage = useSelector(selectCurrentPage).page;
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);
  const dispatch = useDispatch();

  createListeners(
      // in a beautiful future, move it to connector
      dispatch,
      useSelector((state) => state)
  );

  // add document listeners
  useEffect(() => {
    window.addEventListener("storage", () => {
      localStorage.getItem("secondSession") ? setIsInvalidSession(true) : setIsInvalidSession(false);
    });
    connector.attachStaticScripts();
    connector.onTabUpdate(() => {
      dispatch(clearAll());
      locatorGenerationController.revokeAll();
      dispatch(removeEmptyPOs());
      removeOverlay();
      connector.attachStaticScripts();
    });
  }, []);

  useEffect(() => {
    if (status === identificationStatus.success) {
      dispatch(changePage({ page: pageType.locatorsList, pageObj: currentPageObject }));
    }
  }, [status]);

  const renderPage = () => {
    return currentPage === pageType.pageObject ? <PageObjectPage /> : <LocatorsPage />;
  };

  const handleConfirm = () => {
    const inProgress = selectInProgressToConfirm(state);
    if (size(inProgress)) {
      openConfirmInProgressPopup();
    } else {
      locatorGenerationController.revokeAll();
      const locatorIds = selectLocatorsToConfirm(state, currentPageObject).map((loc) => loc.element_id);
      dispatch(confirmLocators({ id: currentPageObject, locatorIds: locatorIds }));
      dispatch(changePage({ page: pageType.pageObject, pageObj: currentPageObject }));
    }
  };

  const handleBack = () => {
    openConfirmBackPopup();
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
      const waitingSelected = selectWaitingSelectedByPageObj(state, currentPageObject);
      const generatedSelected = selectGeneratedSelectedByPageObj(state, currentPageObject);
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
      <Layout className="jdn__autofind">
        <Header className="jdn__header">
          <ControlBar />
        </Header>
        <Content className="jdn__content">
          {isInvalidSession ? <SeveralTabsWarning /> : renderPage()}
          <div className="jdn__navigation">
            {renderBackButton()}
            {renderConfirmButton()}
          </div>
        </Content>
      </Layout>
    </React.Fragment>
  );
};

export default AutoFind;
