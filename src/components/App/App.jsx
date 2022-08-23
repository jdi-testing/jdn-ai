import {
  Provider as ReduxProvider,
  useDispatch,
  useSelector,
} from "react-redux";
import React, { useEffect, useState } from "react";
import ReactDOM from "react-dom";

import "antd/dist/antd.less";
import "antd/lib/style/themes/default.less";

import { store } from "../../store/store";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import { changePage } from "../../store/slices/mainSlice";
import { ControlBar } from "./ControlBar";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { Backdrop } from "./Backdrop/Backdrop";
import { LocatorsPage } from "../Locators/LocatorsPage";
import {
  BACKEND_STATUS,
  identificationStatus,
  pageType,
  readmeLinkAddress,
} from "../../utils/constants";
import { selectCurrentPage } from "../../store/selectors/mainSelectors";
import { PageObjectPage } from "../PageObjects/PageObjectPage";
import { DOWNLOAD_TEMPLATE, request } from "../../services/backend";
import Title from "antd/lib/typography/Title";
import { useOnTabUpdate } from "./useOnTabUpdate";
import { checkSession } from "./appUtils";

import "../../css/index.less";

const ACCESS_MESSAGE = "Trying to access server...";

const App = () => {
  const [isInvalidSession, setIsInvalidSession] = useState(false);
  const [template, setTemplate] = useState();
  const status = useSelector((state) => state.locators.status);
  const backendAvailable = useSelector((state) => state.main.backendAvailable);
  const currentPage = useSelector(selectCurrentPage);
  const currentPageObject = useSelector(
    (state) => state.pageObject.currentPageObject
  );
  const dispatch = useDispatch();

  useOnTabUpdate();

  useEffect(() => {
    checkSession(setIsInvalidSession);
  }, []);

  useEffect(() => {
    const fetchTemplate = async () => {
      setTemplate(await request.getBlob(DOWNLOAD_TEMPLATE));
    };
    
    if (backendAvailable === BACKEND_STATUS.ACCESSED) {
      fetchTemplate();
    }
  }, [backendAvailable]);

  useEffect(() => {
    if (status === identificationStatus.success) {
      dispatch(
        changePage({ page: pageType.locatorsList, pageObj: currentPageObject })
      );
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

  const renderMessage = () => {
    if (backendAvailable === BACKEND_STATUS.TRY_TO_ACCESS) {
      return ACCESS_MESSAGE;
    } else {
      return (
        <span>
          Server doesn&apos;t respond. Please, check network settings or set up
          a local server (see{" "}
          <a href={readmeLinkAddress} target="_blank" rel="noreferrer">
            Readme
          </a>{" "}
          for details).
        </span>
      );
    }
  };

  return (
    <ReduxProvider {...{ store }}>
      <div>
        <Backdrop />
        <Layout className="jdn__autofind">
          <Header className="jdn__header">
            <ControlBar />
          </Header>
          <Content className="jdn__content">
            {backendAvailable === BACKEND_STATUS.ACCESSED ? (
              isInvalidSession ? (
                <SeveralTabsWarning
                  {...{ checkSession: () => checkSession(setIsInvalidSession) }}
                />
              ) : (
                renderPage()
              )
            ) : (
              <Title level={5}>{renderMessage()}</Title>
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
