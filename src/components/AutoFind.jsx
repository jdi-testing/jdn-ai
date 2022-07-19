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
import { identificationStatus, pageType, SCRIPT_ERROR } from "../utils/constants";

import { selectCurrentPage } from "../store/selectors/mainSelectors";
import { PageObjectPage } from "./PageObjects/PageObjectPage";
import { removeEmptyPageObjects } from "../store/thunks/removeEmptyPageObjects";
import { DOWNLOAD_TEMPLATE, request } from "../services/backend";
import Title from "antd/lib/typography/Title";

const ACCESS_MESSAGE = "Trying to access server...";

const AutoFind = () => {
  const [isInvalidSession, setIsInvalidSession] = useState(false);
  const [template, setTemplate] = useState();
  const status = useSelector((state) => state.locators.status);
  const isBackendAvailable = useSelector((state) => state.main.isBackendAvailable);
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

    fetchTemplate();
  }, []);

  useEffect(() => {
    if (status === identificationStatus.success) {
      dispatch(changePage({ page: pageType.locatorsList, pageObj: currentPageObject }));
    }
  }, [status]);

  const checkSession = () => {
    setIsInvalidSession(false);
    sendMessage.checkSession(null).then((payloads) => {
      payloads.forEach((payload) => {
        if (payload && payload.message !== SCRIPT_ERROR.NO_CONNECTION && payload.tabId !== connector.tabId) {
          setIsInvalidSession(true);
        }
      });
    });
  };

  const fetchTemplate = async () => {
    const result = await request.getBlob(DOWNLOAD_TEMPLATE);
    setTemplate(result);
  };

  const renderPage = () => {
    const { page, alreadyGenerated } = currentPage;
    return page === pageType.pageObject ? (
      <PageObjectPage {...{ template }} />
    ) : (
      <LocatorsPage {...{ alreadyGenerated }} />
    );
  };

  return (
    <React.Fragment>
      <Layout className="jdn__autofind">
        <Header className="jdn__header">
          <ControlBar />
        </Header>
        <Content className="jdn__content">
          {isBackendAvailable ? (
            isInvalidSession ? (
              <SeveralTabsWarning {...{ checkSession }} />
            ) : (
              renderPage()
            )
          ) : (
            <Title level={5}>{ACCESS_MESSAGE}</Title>
          )}
        </Content>
      </Layout>
    </React.Fragment>
  );
};

export default AutoFind;
