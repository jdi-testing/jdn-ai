import { useDispatch, useSelector } from "react-redux";
import Layout, { Content, Header } from "antd/lib/layout/layout";
import React, { useEffect, useState } from "react";

import { clearAll } from "../store/predictionSlice";
import { connector } from "../services/connector";
import { ControlBar } from "./ControlBar";
import { createListeners } from "../services/scriptListener";
import { GenerationButtons } from "./GenerationButtons";
import { SeveralTabsWarning } from "./SeveralTabsWarning";
import { locatorGenerationController } from "../services/locatorGenerationController";
import { LocatorsList } from "./locatorsList/LocatorsList";
import { PerceptionTreshold } from "./PerceptionTreshold/PerceptionTreshold";
import { removeOverlay } from "../services/pageDataHandlers";
import { xpathGenerationStatus } from "../utils/constants";

const AutoFind = () => {
  const [isInvalidSession, setIsInvalidSession] = useState(localStorage.getItem('secondSession'));
  const xpathStatus = useSelector((state) => state.main.xpathStatus);

  const dispatch = useDispatch();
  createListeners( // in the future, move it to connector
      dispatch,
      useSelector((state) => state)
  );

  // add document listeners
  useEffect(() => {
    window.addEventListener('storage', () => {
      localStorage.getItem('secondSession') ? setIsInvalidSession(true) : setIsInvalidSession(false);
    });
    connector.attachStaticScripts();
    connector.onTabUpdate(() => {
      dispatch(clearAll());
      locatorGenerationController.revokeAll();
      removeOverlay();
      connector.attachStaticScripts();
    });
  }, []);

  return (
    <React.Fragment>
      <Layout className="jdn__autofind">
        <Header className="jdn__header">
          <ControlBar />
        </Header>
        <Content className="jdn__content">
          {isInvalidSession ? (<SeveralTabsWarning />) : (<GenerationButtons />)}
          {!isInvalidSession && xpathStatus === xpathGenerationStatus.started ? (
            <React.Fragment>
              <LocatorsList />
              <PerceptionTreshold />
            </React.Fragment>
          ) : null}
          {/* <XPathSettings />*/}
        </Content>
      </Layout>
    </React.Fragment>
  );
};

export default AutoFind;
