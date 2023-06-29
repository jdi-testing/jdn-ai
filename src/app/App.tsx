import React, { useEffect, useState } from "react";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

import "antd/dist/antd.less";
import "antd/lib/style/themes/default.less";

import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Backdrop } from "./components/Backdrop";
import { StatusBar } from "./components/StatusBar";
import { SeveralTabsWarning } from "./components/SeveralTabsWarning";
import { HttpEndpoint, request } from "../services/backend";
import { checkSession, getSessionId } from "./utils/appUtils";
import { selectCurrentPage } from "./main.selectors";
import { RootState, store } from "./store/store";
import { useOnDisconnect } from "./utils/useOnDisconnect";

import { defineServer } from "./reducers/defineServer.thunk";
import { Guide } from "./components/Guide";
import "./styles/index.less";
import { BackendStatus } from "./types/mainSlice.types";
import { LocatorsPage } from "../features/locators/LocatorsPage";
import { PageObjectPage } from "../features/pageObjects/PageObjectPage";
import { OnboardingProvider } from "../features/onboarding/OnboardingProvider";
import { isPageObjectPage } from "./utils/heplers";

const App = () => {
  const [isInvalidSession, setIsInvalidSession] = useState(false);
  const [template, setTemplate] = useState<Blob | undefined>(undefined);
  const backendAvailable = useSelector((state: RootState) => state.main.backendAvailable);
  const currentPage = useSelector(selectCurrentPage);
  const dispatch = useDispatch();

  useOnDisconnect();

  useEffect(() => {
    checkSession(setIsInvalidSession); // no need to refactor, we will get rid of it soon
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

  const renderPage = () => {
    const { page } = currentPage;
    return isPageObjectPage(page) ? <PageObjectPage {...{ template }} /> : <LocatorsPage />;
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

export const ReduxApp = () => (
  <ReduxProvider {...{ store }}>
    <OnboardingProvider>
      <App />
    </OnboardingProvider>
  </ReduxProvider>
);
