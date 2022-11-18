import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

import "antd/dist/antd.less";
import "antd/lib/style/themes/default.less";

import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Backdrop } from "../common/components/Backdrop/Backdrop";
import { identificationStatus, pageType } from "../common/constants/constants";
import { StatusBar } from "../features/statusBar/StatusBar";
import { SeveralTabsWarning } from "../features/tabsWarning/SeveralTabsWarning";
import { HttpEndpoint, request } from "../services/backend";
import { checkSession, getSessionId } from "./appUtils";
import { selectCurrentPage } from "./mainSelectors";
import { changePage } from "./mainSlice";
import { store } from "./store";
import { useOnTabUpdate } from "./useOnTabUpdate";

import { defineServer } from "../common/thunks/defineServer";
import { Guide } from "../features/guide/Guide";
import { connector } from "../pageServices/connector";
import "./index.less";
import { BackendStatus } from "./mainSlice.types";
import { LocatorsPage } from "../features/locators/locatorsPage/LocatorsPage";
import { PageObjectPage } from "../features/pageObjects/pageObjectPage/PageObjectPage";

const App = () => {
  const [isInvalidSession, setIsInvalidSession] = useState(false);
  const [template, setTemplate] = useState();
  const status = useSelector((state) => state.locators.present.status);
  const backendAvailable = useSelector((state) => state.main.backendAvailable);
  const currentPage = useSelector(selectCurrentPage);
  const currentPageObject = useSelector((state) => state.pageObject.present.currentPageObject);
  const dispatch = useDispatch();

  useOnTabUpdate();

  useEffect(() => {
    connector.attachStaticScripts().then(() => {
      checkSession(setIsInvalidSession);
    });
    dispatch(defineServer());
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      setTemplate(await request.getBlob(HttpEndpoint.DOWNLOAD_TEMPLATE));
    };

    if (backendAvailable === BackendStatus.Accessed) {
      fetchTemplate();
      getSessionId();
    }
  }, [backendAvailable]);

  useEffect(() => {
    if (status === identificationStatus.success) {
      dispatch(changePage({ page: pageType.locatorsList, pageObj: currentPageObject }));
    }
  }, [status]);

  const renderPage = () => {
    const { page, alreadyGenerated } = currentPage;
    return page === pageType.pageObject ? (
      <PageObjectPage {...{ template }} />
    ) : (
      <LocatorsPage {...{ alreadyGenerated }} />
    );
  };

  return (
    <ReduxProvider {...{ store }}>
      <div>
        <Backdrop />
        <Layout className="jdn__app">
          <Header className="jdn__header">
            <StatusBar />
          </Header>
          <Content className="jdn__content">
            {backendAvailable === BackendStatus.Accessed ? (
              isInvalidSession ? (
                <SeveralTabsWarning {...{ checkSession: () => checkSession(setIsInvalidSession) }} />
              ) : (
                renderPage()
              )
            ) : backendAvailable === BackendStatus.TryToAccess ? (
              BackendStatus.TryToAccess
            ) : (
              <Guide />
            )}
          </Content>
        </Layout>
      </div>
    </ReduxProvider>
  );
};

const ReduxApp = () => (
  <ReduxProvider {...{ store }}>
    <App />
  </ReduxProvider>
);

const div = document.getElementById("chromeExtensionReactApp");

if (div instanceof Element) {
  ReactDOM.render(<ReduxApp />, div);
}
