import React, { useEffect, useState } from "react";
import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";

import "antd/dist/antd.less";
import "antd/lib/style/themes/default.less";

import Layout, { Content, Header } from "antd/lib/layout/layout";
import { Backdrop } from "./components/Backdrop";
import { StatusBar } from "./components/StatusBar";
import { SeveralTabsWarning } from "./components/SeveralTabsWarning";
import { HttpEndpoint, request } from "../services/backend";
import { checkSession, initLocatorSocketController } from "./utils/appUtils";
import { selectCurrentPage } from "./main.selectors";
import { RootState, store } from "./store/store";
import { useOnDisconnect } from "./utils/useOnDisconnect";

import { defineServer } from "./reducers/defineServer.thunk";
import { Guide } from "./components/guide/Guide";
import "./styles/index.less";
import { BackendStatus } from "./types/mainSlice.types";
import { setIsSessionUnique } from "./main.slice";
import { LocatorsPage } from "../features/locators/LocatorsPage";
import { PageObjectPage } from "../features/pageObjects/PageObjectPage";
import { OnboardingProvider } from "../features/onboarding/OnboardingProvider";
import { isPageObjectPage } from "./utils/heplers";
import { selectCurrentPageObject, selectLastFrameworkType } from "../features/pageObjects/selectors/pageObjects.selectors";
import { getLocalStorage, LocalStorageKey } from "../common/utils/localStorage";
import { FrameworkType } from "../common/types/common";

const App = () => {
  const [template, setTemplate] = useState<Blob | undefined>(undefined);
  const backendAvailable = useSelector((state: RootState) => state.main.backendAvailable);
  const xpathConfig = useSelector((state: RootState) => state.main.xpathConfig);
  const currentPage = useSelector(selectCurrentPage);
  const currentPageObject = useSelector(selectCurrentPageObject);
  const dispatch = useDispatch();
  const isSessionUnique = useSelector((state: RootState) => state.main.isSessionUnique);

  useOnDisconnect();
  const updateIsSessionUnique = (isInvalidSession: boolean) => {
    store.dispatch(setIsSessionUnique(!isInvalidSession));
  };

  useEffect(() => {
    checkSession(updateIsSessionUnique); // no need to refactor, we will get rid of it in future (hopefully soon)
    dispatch(defineServer());
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      setTemplate(await request.getBlob(HttpEndpoint.DOWNLOAD_TEMPLATE));
      // setTemplate(
      //   await request.getBlob(
      //     framework === FrameworkType.Vividus ? HttpEndpoint.DOWNLOAD_TEMPLATE_VIVIDUS : HttpEndpoint.DOWNLOAD_TEMPLATE
      //   )
      // );
    };

    if (backendAvailable === BackendStatus.Accessed) {
      // fetchTemplate(getLocalStorage(LocalStorageKey.Framework));
      fetchTemplate();
      initLocatorSocketController(xpathConfig);
    }
  }, [backendAvailable]);

  const renderPage = () => {
    const { page } = currentPage;
    console.log("🥵");
    console.log(currentPageObject);
    return isPageObjectPage(page) ? <PageObjectPage /> : <LocatorsPage />;
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
            !isSessionUnique ? (
              <SeveralTabsWarning {...{ checkSession: () => checkSession(updateIsSessionUnique) }} />
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

export const ReduxApp = () => {
  return (
    <ReduxProvider {...{ store }}>
      <OnboardingProvider>
        <App />
      </OnboardingProvider>
    </ReduxProvider>
  );
};
