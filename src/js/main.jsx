import React from "react";
import ReactDOM from "react-dom";
import injectSheet from "react-jss";
import { inject, observer, Provider } from "mobx-react";
import { action, computed, observable } from "mobx";

import GenerateResults from "./blocks/generate/GenerateResults";
import GeneralSettings from "./blocks/generate/GeneralSettings";
import { RulesBlock } from "./blocks/rules/RulesBlock";

import GenerateBlock from "./blocks/generate/GenerateBlock";

import MainModel from "./models/MainModel";

import { Menu, Button, Row, Col } from "antd";
const { SubMenu } = Menu;

import "antd/lib/style/themes/default.less";
import "antd/dist/antd.less";
import "../css/main.less";
import LogComponentWrapper from "./blocks/log/LogComponent";
import AutoFind from "./blocks/autoFind/components/autoFind/AutoFind";
import { AutoFindProvider } from "./blocks/autoFind/autoFindProvider/AutoFindProvider";

const styles = {
  commonContainer: {
    position: "relative",
  },
  contentContainerDesktopTablet: {
    display: "flex",
    flexGrow: 1,
    marginLeft: "42px",
    height: "100vh",
    minHeight: "fit-content",
  },
  contentContainerMobile: {
    display: "flex",
    flexDirection: "column",
    flexGrow: 1,
    height: "400px",
    minHeight: "fit-content",
  },
};

@observer
class App extends React.Component {
  @observable mainModel = new MainModel();

  handleClick = (e) => {
    this.mainModel.setTab(e.key);
    this.setState({ tab: e.key });
  };

  @action
  handleGenerate = (mainModel) => {
    mainModel.generateBlockModel.generate(mainModel, () => {
      this.handleClick({ key: "results" });
      this.mainModel.generationId++;
    });
  };

  @computed get tab() {
    return this.mainModel.tab;
  }

  render() {
    const { classes } = this.props;
    return (
      <Provider mainModel={this.mainModel}>
        <AutoFindProvider>
          <div className={classes.commonContainer}>
            {/* UNCOMMENT THIS PART 
              TO MAKE THE REST FUNCTIONALITY AVAILABLE */}
            {/* <Menu onClick={this.handleClick} selectedKeys={[this.tab]} mode="horizontal" className="jdn__hidden">
              <Menu.Item key="auto_find">Auto Find Objects</Menu.Item>

              <Menu.Item key="settings">Settings</Menu.Item>
              <Menu.Item key="urls">URLs</Menu.Item>
              <Menu.Item key="results">Results</Menu.Item>
              <Menu.Item disabled={true}>
                <Button
                  onClick={() => {
                    this.handleGenerate(this.mainModel);
                  }}
                  size={"small"}
                  type="primary"
                >
                  GENERATE
                </Button>
              </Menu.Item>
              <Menu.Item key="warnings">Warnings</Menu.Item>
            </Menu> */}

            {this.tab === "settings" && (
              <div key="settings">
                <Row>
                  <Col span={8}>
                    <GeneralSettings></GeneralSettings>
                  </Col>
                  <Col
                    span={16}
                    style={{
                      padding: "10px",
                      minHeight: "100vh",
                      borderLeft: "2px solid #d8d8d8",
                    }}
                  >
                    <RulesBlock></RulesBlock>
                  </Col>
                </Row>
              </div>
            )}

            {this.tab === "urls" && <GenerateBlock key="urls"></GenerateBlock>}

            {this.tab === "results" && <GenerateResults key={this.mainModel.generationId}></GenerateResults>}

            {this.tab === "warnings" && <LogComponentWrapper key={this.mainModel.showLog} />}

            {this.tab === "auto_find" && <AutoFind key="auto_find" />}
          </div>
        </AutoFindProvider>
      </Provider>
    );
  }
}

const AppWrapper = injectSheet(styles)(App);

const div = document.getElementById("chromeExtensionReactApp");

if (div instanceof Element) {
  ReactDOM.render(<AppWrapper />, div);
}
