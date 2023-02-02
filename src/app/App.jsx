import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

import "antd/dist/antd.less";
import "antd/lib/style/themes/default.less";

import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Backdrop } from "./components/Backdrop";
import { identificationStatus, pageType } from "../common/constants/constants";
import { StatusBar } from "./components/StatusBar";
import { SeveralTabsWarning } from "./components/SeveralTabsWarning";
import { HttpEndpoint, request } from "../services/backend";
import { checkSession, getSessionId } from "./utils/appUtils";
import { selectCurrentPage } from "./main.selectors";
import { changePage } from "./main.slice";
import { store } from "./store/store";
import { useOnTabUpdate } from "./utils/useOnTabUpdate";

import { defineServer } from "./reducers/defineServer.thunk";
import { Guide } from "./components/Guide";
import { connector } from "../pageServices/connector";
import "./styles/index.less";
import { BackendStatus } from "./types/mainSlice.types";
import { LocatorsPage } from "../features/locators/LocatorsPage";
import { PageObjectPage } from "../features/pageObjects/PageObjectPage";

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
    connector.onTabUpdate(() => {
      dispatch(clearAll());
      locatorGenerationController.revokeAll();
      dispatch(removeEmptyPageObjects());
      removeOverlay();
      connector.attachStaticScripts();
    });
  }, []);

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
