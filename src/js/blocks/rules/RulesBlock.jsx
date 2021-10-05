import React from "react";
import ReactFileReader from "react-file-reader";
import injectSheet from "react-jss";
import { inject, observer } from "mobx-react";
import { observable, action, toJS } from "mobx";
import PropTypes from "prop-types";
import { Button, Col } from "antd";
import { exportIcon, importIcon } from "../../../icons";
import { headerStyle } from "../BlockStyles";
import { CaretRightOutlined, Icon } from "@ant-design/icons";
import { RuleForElement } from "./RuleForElement";

@observer
class ListOfHiddenItems extends React.Component {
  @observable show = false;
  hiddenRule = true;

  @action
  handleShowList = () => {
    this.show = !this.show;
    this.setState({show: this.show});
  };

  render() {
    const { name, list, className, linkClass, ruleSet } = this.props;


    return (
      <li>
        <a className={linkClass} onClick={this.handleShowList}>
          <span className={"treeCounter"}>{list.length}</span>
          <CaretRightOutlined rotate={this.show ? 0 : 90} />
          {name}
        </a>
        {this.show && (
          <ul className={className}>
            {list.map((item, index) => (
              <li
                key={item + index}
                onClick={() => {
                  this.hiddenRule = !this.hiddenRule;
                }}
              >
                <RuleForElement
                  ruleSet={ruleSet}
                  title={item}
                  index={index}
                  hidden={this.hiddenRule}
                />
              </li>
            ))}
          </ul>
        )}
      </li>
    );
  }
}

@inject("mainModel")
@observer
export class RulesBlock extends React.Component {
  handleExportRules = () => {
    const { mainModel } = this.props;
    const rulesName = mainModel.settingsModel.framework;

    mainModel.ruleBlockModel.downloadCurrentRules(rulesName);
  };

  handleImportRules = (file) => {
    const { mainModel } = this.props;

    mainModel.generateBlockModel.clearGeneration();
    mainModel.ruleBlockModel.importRules(file, mainModel);
  };

  render() {
    const { classes, mainModel } = this.props;
    const simpleRules =
      Object.keys(mainModel.ruleBlockModel.rules.SimpleRules) || [];
    const complexRules =
      Object.keys(mainModel.ruleBlockModel.rules.ComplexRules) || [];
    const compositeRules =
      Object.keys(mainModel.ruleBlockModel.rules.CompositeRules) || [];

    return (
      <div>
        <div>
          Rules:
          <div style={{ textAlign: "right", width: "100%" }}>
            <div style={{ display: "inline-block" }}>
              <ReactFileReader
                handleFiles={(file) => {
                  this.handleImportRules(file);
                }}
                fileTypes={[".json"]}
                multipleFiles={false}
              >
                <Button size={"small"}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                  >
                    <path
                      fill="#464547"
                      d="M8.25 12.125c.365 0 .674-.128.93-.383l3.937-3.937c.255-.274.383-.588.383-.944 0-.355-.123-.66-.37-.916-.245-.255-.56-.383-.943-.383h-1.421V2.938c0-.364-.128-.674-.383-.93-.255-.254-.565-.382-.93-.382H7.047c-.365 0-.675.128-.93.383s-.383.565-.383.93v2.624H4.313c-.365 0-.67.128-.917.383-.246.256-.373.56-.382.916-.01.356.114.67.369.944l3.937 3.937c.256.255.565.383.93.383zm0-1.313L4.312 6.876h2.735V2.937h2.406v3.938h2.735L8.25 10.813zm4.922 3.063c.091 0 .168-.032.232-.096s.096-.141.096-.232v-.656c0-.092-.032-.169-.096-.233s-.141-.095-.232-.095H3.328c-.091 0-.168.031-.232.095S3 12.8 3 12.891v.656c0 .091.032.168.096.232s.141.096.232.096h9.844z"
                    />
                  </svg>
                  Import
                </Button>
              </ReactFileReader>
            </div>
            <Button size={"small"} onClick={this.handleExportRules}>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 16 16"
              >
                <path
                  fill="#464547"
                  d="M9.453 11.688c.365 0 .675-.128.93-.383.255-.256.383-.565.383-.93V8.187h1.421c.383 0 .698-.127.944-.382.246-.256.369-.56.369-.916s-.128-.67-.383-.944L9.18 2.008c-.256-.255-.565-.383-.93-.383-.365 0-.674.128-.93.383L3.383 5.945C3.128 6.22 3 6.533 3 6.89c0 .355.123.66.37.916.245.255.56.383.942.383h1.422v2.187c0 .365.128.674.383.93.255.255.565.383.93.383h2.406zm0-1.313H7.047v-3.5H4.313L8.25 2.937l3.938 3.938H9.453v3.5zm3.719 3.5c.091 0 .168-.032.232-.096s.096-.141.096-.232v-.656c0-.092-.032-.169-.096-.233s-.141-.095-.232-.095H3.328c-.091 0-.168.031-.232.095S3 12.8 3 12.891v.656c0 .091.032.168.096.232s.141.096.232.096h9.844z"
                />
              </svg>
              Export
            </Button>
          </div>
        </div>
        <div>
          <ul className="list">
            <ListOfHiddenItems
              name={"Simple elements"}
              className="list"
              linkClass="link"
              list={simpleRules}
              ruleSet={"SimpleRules"}
            />
            <ListOfHiddenItems
              name={"Complex elements"}
              className="list"
              linkClass="link"
              list={complexRules}
              ruleSet={"ComplexRules"}
            />
            <ListOfHiddenItems
              name={"Composite elements"}
              className="list"
              linkClass="link"
              list={compositeRules}
              ruleSet={"CompositeRules"}
            />
          </ul>
        </div>
      </div>
    );
  }
}
