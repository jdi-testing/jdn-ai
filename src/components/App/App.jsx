import { Provider as ReduxProvider, useDispatch, useSelector } from "react-redux";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import "antd/dist/antd.less";
import "antd/lib/style/themes/default.less";

import { store } from "../../store/store";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import { changePage } from "../../store/slices/mainSlice";
import { StatusBar } from "./StatusBar";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { Backdrop } from "./Backdrop/Backdrop";
import { LocatorsPage } from "../Locators/LocatorsPage";
import { identificationStatus, pageType } from "../../utils/constants";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { PageObjectPage } from "../PageObjects/PageObjectPage";
import { HttpEndpoint, request } from "../../services/backend";
import { useOnTabUpdate } from "./useOnTabUpdate";
import { checkSession, getSessionId } from "./appUtils";

import "../../css/index.less";
import { connector } from "../../services/connector";
import { defineServer } from "../../store/thunks/defineServer";
import { BackendStatus } from "../../store/slices/mainSlice.types";
import { Guide } from "./Guide/Guide";

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
        <Layout className="jdn__autofind">
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
