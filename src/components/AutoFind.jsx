import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout, { Content, Header } from "antd/lib/layout/layout";

import { changePage, clearAll } from "../store/slices/mainSlice";
import { connector } from "../services/connector";
import { ControlBar } from "./ControlBar";
import { createListeners } from "../services/scriptListener";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { removeOverlay } from "../services/pageDataHandlers";
import { LocatorsPage } from "./Locators/LocatorsPage";
import { identificationStatus, pageType } from "../utils/constants";

import { selectCurrentPage } from "../store/selectors/mainSelectors";
import { removeEmptyPOs } from "../store/slices/pageObjectSlice";
import { PageObjectPage } from "./PageObjects/PageObjectPage";

const AutoFind = () => {
  const [isInvalidSession, setIsInvalidSession] = useState(localStorage.getItem("secondSession"));
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

  return (
    <React.Fragment>
      <Layout className="jdn__autofind">
        <Header className="jdn__header">
          <ControlBar />
        </Header>
        <Content className="jdn__content">{isInvalidSession ? <SeveralTabsWarning /> : renderPage()}</Content>
      </Layout>
    </React.Fragment>
  );
};

export default AutoFind;
