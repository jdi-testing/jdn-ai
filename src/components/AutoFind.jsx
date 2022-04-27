import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Layout, { Content, Header } from "antd/lib/layout/layout";

import { changePage, clearAll } from "../store/slices/mainSlice";
import { connector, sendMessage } from "../services/connector";
import { ControlBar } from "./ControlBar";
import { createListeners } from "../services/scriptListener";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { removeOverlay } from "../services/pageDataHandlers";
import { LocatorsPage } from "./Locators/LocatorsPage";
import { identificationStatus, pageType } from "../utils/constants";

import { selectCurrentPage } from "../store/selectors/mainSelectors";
import { PageObjectPage } from "./PageObjects/PageObjectPage";
import { removeEmptyPageObjects } from "../store/thunks/removeEmptyPageObjects";

const AutoFind = () => {
  const [isInvalidSession, setIsInvalidSession] = useState(false);
  const status = useSelector((state) => state.locators.status);
  const currentPage = useSelector(selectCurrentPage);
  const currentPageObject = useSelector((state) => state.pageObject.currentPageObject);
  const dispatch = useDispatch();

  createListeners(
      // in a beautiful future, move it to connector
      dispatch,
      useSelector((state) => state)
  );

  // add document listeners
  useEffect(() => {
    connector.attachStaticScripts().then(() => {
      checkSession();
    });
    connector.onTabUpdate(() => {
      dispatch(clearAll());
      locatorGenerationController.revokeAll();
      dispatch(removeEmptyPageObjects());
      removeOverlay();
      connector.attachStaticScripts();
    });
  }, []);

  useEffect(() => {
    if (status === identificationStatus.success) {
      dispatch(changePage({ page: pageType.locatorsList, pageObj: currentPageObject }));
    }
  }, [status]);

  const checkSession = () => {
    setIsInvalidSession(false);
    sendMessage.checkSession(null, (payload) => {
      if (payload && payload.tabId !== connector.tabId) {
        setIsInvalidSession(true);
      }
    });
  };

  const renderPage = () => {
    const { page, alreadyGenerated } = currentPage;
    return page === pageType.pageObject ? <PageObjectPage /> : <LocatorsPage {...{ alreadyGenerated }} />;
  };

  return (
    <React.Fragment>
      <Layout className="jdn__autofind">
        <Header className="jdn__header">
          <ControlBar />
        </Header>
        <Content className="jdn__content">
          {isInvalidSession ? <SeveralTabsWarning {...{ checkSession }} /> : renderPage()}
        </Content>
      </Layout>
    </React.Fragment>
  );
};

export default AutoFind;
