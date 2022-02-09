import { useDispatch, useSelector } from "react-redux";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import React, { useEffect, useState } from "react";

import { clearAll } from "../store/predictionSlice";
import { connector } from "../services/connector";
import { ControlBar } from "./ControlBar";
import { createListeners } from "../services/scriptListener";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { removeOverlay } from "../services/pageDataHandlers";
import { PageObjPage } from "./pageObjPage/pageObjPage";
import { LocatorsPage } from "./locatorsPage/LocatorsPage";

const modes = {
  pageObject: "pageObject",
  locatorsList: "locatorsList",
};

const AutoFind = () => {
  const [viewMode, setViewMode] = useState(modes.pageObject);
  const [isInvalidSession, setIsInvalidSession] = useState(localStorage.getItem("secondSession"));

  const dispatch = useDispatch();
  createListeners(
      // in the future, move it to connector
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

  const renderPage = () => {
    return viewMode === modes.pageObject ? <PageObjPage /> : <LocatorsPage />;
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
        </Content>
      </Layout>
    </React.Fragment>
  );
};

export default AutoFind;
