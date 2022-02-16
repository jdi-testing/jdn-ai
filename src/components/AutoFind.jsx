import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Button } from "antd";
import Icon from "@ant-design/icons";

import { changePage, changePageBack, clearAll } from "../store/slices/mainSlice";
import { connector } from "../services/connector";
import { ControlBar } from "./ControlBar";
import { createListeners } from "../services/scriptListener";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { openConfirmPopup, removeOverlay } from "../services/pageDataHandlers";
import { LocatorsPage } from "./locatorsPage/LocatorsPage";
import { identificationStatus, pageType } from "../utils/constants";
import { PageObjectPage } from "./pageObjectPage/PageObjectPage";

import CaretDownSvg from "../assets/caret-down.svg";
import { selectCurrentPage } from "../store/selectors/mainSelectors";
import { selectPageObjById } from "../store/selectors/pageObjectSelectors";
import { size } from "lodash";
import { setConfirmed } from "../store/slices/pageObjectSlice";

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
    locatorGenerationController.revokeAll();
    dispatch(setConfirmed(currentPageObject));
    dispatch(changePage({ page: pageType.pageObject, pageObj: currentPageObject }));
  };

  const handleBack = () => {
    const pageObject = selectPageObjById(state, currentPageObject);
    if (!pageObject.confirmed) {
      openConfirmPopup();
    } else {
      dispatch(changePageBack());
    }
  };

  const renderBackButton = () => {
    const pageObject = selectPageObjById(state, currentPageObject);
    const historyExists = size(useSelector((state) => state.main.pageHistory)) > 1;
    return (
      <React.Fragment>
        {(currentPage === pageType.pageObject && size(pageObject && pageObject.locators) && historyExists) ||
        currentPage === pageType.locatorsList ? (
          <Button onClick={handleBack} className="jdn__buttons">
            <Icon component={CaretDownSvg} rotate={90} fill="#1582D8" />
            Back
          </Button>
        ) : null}
      </React.Fragment>
    );
  };

  const renderConfirmButton = () => {
    return (
      <React.Fragment>
        {currentPage === pageType.locatorsList ? (
          <Button type="primary" onClick={handleConfirm} className="jdn__buttons">
            Confirm
            <Icon component={CaretDownSvg} rotate={270} fill="#ffffff" />
          </Button>
        ) : null}
      </React.Fragment>
    );
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
