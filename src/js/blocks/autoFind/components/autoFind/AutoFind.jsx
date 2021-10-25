import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";

import "./slider.less";
import "./../autoFind.less";

import Layout, { Content, Header } from "antd/lib/layout/layout";
import { GenerationButtons } from "../GenerationButtons";
import { PerceptionTreshold } from "../PerceptionTreshold";
import { ControlBar } from "../ControlBar";
// import { XPathSettings } from "../XPathSettings";
import { LocatorsList } from "../locatorsList/LocatorsList";
import { xpathGenerationStatus } from "../../autoFindProvider/AutoFindProvider";

// import { store } from "../../redux/store";
import { createListeners } from "../../utils/scriptListener";
import { connector } from "../../utils/connector";
import { removeOverlay } from "../../utils/pageDataHandlers";
import { clearAll } from "../../redux/predictionSlice";

const AutoFind = () => {
  const xpathStatus = useSelector((state) => state.main.xpathStatus);

  const dispatch = useDispatch();
  createListeners(
      dispatch,
      useSelector((state) => state.main)
  );

  // add document listeners
  useEffect(() => {
    connector.attachStaticScripts();
    connector.onTabUpdate(() => {
      dispatch(clearAll());
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
          <GenerationButtons />
          {xpathStatus === xpathGenerationStatus.started ? (
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
