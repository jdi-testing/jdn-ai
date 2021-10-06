import React from "react";

import "./slider.less";
import "./../autoFind.less";

import Layout, { Content, Footer, Header } from "antd/lib/layout/layout";
import { GenerationButtons } from "../GenerationButtons";
import { PerceptionTreshold } from "../PerceptionTreshold";
import { Result } from "../Result";
import { Space } from "antd";
import { ControlBar } from "../ControlBar";
import { XPathSettings } from "../XPathSettings";
import { LocatorsList } from "../locatorsList/LocatorsList";
import { useAutoFind, xpathGenerationStatus } from "../../autoFindProvider/AutoFindProvider";

const AutoFind = () => {
  const [{ xpathStatus }, {}] = useAutoFind();

  return (
    <Layout className="jdn__autofind">
      <Header className="jdn__header">
        <ControlBar />
      </Header>
      <Content className="jdn__content">
        <GenerationButtons />
        {xpathStatus === xpathGenerationStatus.started ? (
          <React.Fragment>
            <LocatorsList />
          </React.Fragment>
        ) : null}
        {/* <XPathSettings />
        <Result /> */}
      </Content>
      {xpathStatus === xpathGenerationStatus.started ? (
        <Footer>
          <PerceptionTreshold />
        </Footer>
      ) : null}
    </Layout>
  );
};

export default AutoFind;
