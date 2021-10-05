import React from "react";
import injectSheet from "react-jss";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { SearchOutlined } from "@ant-design/icons";
import { Button, Select } from "antd";
import {computed, toJS} from "mobx";


@inject("mainModel")
@observer
export default class GenerateResults extends React.Component {

  generateBlockModel;

  @computed get result() {
    const { mainModel } = this.props;
    return mainModel.generateBlockModel.pages;
  }

  handleDownloadSiteCode = () => {
    const { mainModel } = this.props;
    mainModel.conversionModel.clearOldConversion();
    mainModel.generateBlockModel.pages.forEach((p) => {
      mainModel.conversionModel.genPageCode(p, mainModel);
    });
    mainModel.conversionModel.zipAllCode(mainModel);
  };

  handleDownloadPageCode = (page, index) => {
    const { mainModel } = this.props;
    mainModel.conversionModel.genPageCode(page, mainModel);
    // mainModel.conversionModel.setCurrentPageCode(index);
    mainModel.conversionModel.downloadPageCode(
      page,
      mainModel.settingsModel.extension
    );
  };

  clearGenResults = () => {
    const { mainModel } = this.props;
    mainModel.generateBlockModel.clearGeneration();
    this.setState({generateBlockModel: mainModel.generateBlockModel});
  };

  constructor(props){
    super(props);
  }

  /*eslint complexity: ["error", 6]*/
  render() {
    const { mainModel } = this.props;

    return (
      <div className={"controls-container"}>
        <div key={mainModel.generateBlockModel} className={"button-container"}>
          {
            (mainModel.generateBlockModel) && this.result.length ? (
              <div key={mainModel.generateBlockModel.siteInfo.siteTitle}>
                <Button
                  size={"small"}
                  style={{marginBottom: "5px"}}
                  onClick={this.handleDownloadSiteCode}
                >
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
                  <span>{`Download site ${mainModel.generateBlockModel.siteInfo.siteTitle}`}</span>
                </Button>
              </div>
            ) : ''
          }
          {
            this.result.length ? this.result.map((page, index) => (
              <div key={page.id}>
                <Button
                  size={"small"}
                  style={{ marginBottom: "5px" }}
                  onClick={() => {
                    this.handleDownloadPageCode(page, index);
                  }}
                >
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
                  <span>{`Download page ${page.name}`}</span>
                </Button>
              </div>
            )) : ''
          }
        </div>
        <div>
          {
            <Button size="small" onClick={this.clearGenResults}>
              Clear Results
            </Button>
          }
        </div>
      </div>
    );
  }
}
