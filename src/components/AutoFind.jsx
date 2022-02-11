import { useDispatch, useSelector } from "react-redux";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import React, { useEffect, useState } from "react";

import { changePage, clearAll } from "../store/mainSlice";
import { connector } from "../services/connector";
import { ControlBar } from "./ControlBar";
import { createListeners } from "../services/scriptListener";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { removeOverlay } from "../services/pageDataHandlers";
import { PageObjPage } from "./pageObjectsPage/pageObjPage";
import { LocatorsPage } from "./locatorsPage/LocatorsPage";
import { identificationStatus, pageType } from "../utils/constants";
import { Button } from "antd";

const AutoFind = () => {
  // const [currentPage, setcurrentPage] = useState(pageType.pageObject);
  const [isInvalidSession, setIsInvalidSession] = useState(localStorage.getItem("secondSession"));
  const status = useSelector((state) => state.locators.status);
  const currentPage = useSelector((state) => state.main.currentPage);
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
      dispatch(changePage(pageType.locatorsList));
    }
  }, [status]);

  const renderPage = () => {
    return currentPage === pageType.pageObject ? <PageObjPage /> : <LocatorsPage />;
  };

  return (
    <React.Fragment>
      <Layout className="jdn__autofind">
        <Header className="jdn__header">
          <ControlBar />
        </Header>
        <Content className="jdn__content">
          {isInvalidSession ? <SeveralTabsWarning /> : renderPage()}
          {/* {!isInvalidSession && xpathStatus === xpathGenerationStatus.started ? (
            <React.Fragment>
              <LocatorsList />
              <PerceptionTreshold />
            </React.Fragment>
          ) : null} */}
          {currentPage === pageType.locatorsList ? (
            <Button type="primary" onClick={() => dispatch(changePage(pageType.pageObject))}>
              Confirm
            </Button>
          ) : null}
        </Content>
      </Layout>
    </React.Fragment>
  );
};

export default AutoFind;
