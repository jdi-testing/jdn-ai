import React from "react";
import injectSheet from "react-jss";
import { inject, observer } from "mobx-react";
import { Rules, Languages, Frameworks } from "../../json/settings";
import { Select, Radio, Checkbox, Button } from "antd";
const { Option } = Select;

@inject("mainModel")
@observer
export default class GeneralSettings extends React.Component {
  handleCheckboxChange = (e) => {
    const { mainModel } = this.props;

    mainModel.settingsModel.triggerDownloadAfterGen(mainModel);
    console.log(e);
    this.setState({"generateAndDownload": e});
  };

  handleChangeRule = (option) => {
    const { mainModel } = this.props;

    mainModel.settingsModel.changeRule(option);
    mainModel.generateBlockModel.clearGeneration();
  };

  handleChangeLanguage = (option) => {
    const { mainModel } = this.props;

    mainModel.settingsModel.changeLanguage(option);
    mainModel.generateBlockModel.clearGeneration();
  };

  handleChangeFramework = (option) => {
    const { mainModel } = this.props;

    mainModel.settingsModel.changeFramework(option);
    mainModel.generateBlockModel.clearGeneration();
  };

  render() {
    const { classes, mainModel } = this.props;
    const defaultRule = Rules.find(
      (lang) => lang.value === mainModel.settingsModel.rule
    );
    const defaultLanguage = Languages.find(
      (lang) => lang.value === mainModel.settingsModel.extension
    );
    const defaultFramework = Frameworks.find(
      (frame) => frame.value === mainModel.settingsModel.framework
    );

    // TODO: Use for default value of Rule or delete that property
    // {mainModel.ruleBlockModel.ruleName}
    return (
      <div className={'generate-style'}>
        <div className={'select-wrapper'}>
          <span style={{ margin: "0 10px 0 0" }}>Rules:</span>
          <Select
            size="small"
            defaultValue={defaultRule && defaultRule.value}
            placeholder="Please select"
            onChange={this.handleChangeRule}
            style={{ width: "100%" }}
            options={Rules}
          ></Select>
        </div>
        <div className={"select-wrapper"}>
          <span style={{ margin: "0 10px 0 0" }}>Language:</span>
          <Select
            size="small"
            defaultValue={defaultLanguage && defaultLanguage.value}
            placeholder="Please select"
            onChange={this.handleChangeLanguage}
            style={{ width: "100%" }}
            options={Languages}
          ></Select>
        </div>
        <div className={"select-wrapper"}>
          <span style={{ margin: "0 10px 0 0" }}>Frameworks:</span>
          <Select
            size="small"
            defaultValue={defaultFramework && defaultFramework.value}
            placeholder="Please select"
            onChange={this.handleChangeFramework}
            style={{ width: "100%" }}
            options={Frameworks}
          ></Select>
        </div>
        <div className={"checkbox-wrapper"}>
          <Checkbox
            checked={mainModel.settingsModel.downloadAfterGeneration}
            onChange={this.handleCheckboxChange}
          >
            Generate & Download
          </Checkbox>
        </div>
      </div>
    );
  }
}
