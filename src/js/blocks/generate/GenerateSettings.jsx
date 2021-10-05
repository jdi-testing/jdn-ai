import React from "react";
import injectSheet from "react-jss";
import ReactFileReader from "react-file-reader";
import PropTypes from "prop-types";
import { inject, observer } from "mobx-react";
import { exportIcon, importIcon, back } from "../../../icons";
import { Button } from "antd";

const styles = {
  generateStyle: {
    margin: "10px 0 10px 10px",
  },
  buttonContainer: {
    display: "flex",
    margin: "20px 0",
  },
  btn: {
    marginRight: "5px",
  },
};

@inject("mainModel")
@observer
class GenerateSettings extends React.Component {
  handleSettings = () => {
    const { mainModel } = this.props;
  };

  handleExportTemplate = () => {
    const { mainModel } = this.props;

    mainModel.settingsModel.downloadCurrentTemplate();
  };

  handleImportTemplate = (file) => {
    const { mainModel } = this.props;

    mainModel.generateBlockModel.clearGeneration();
    mainModel.settingsModel.importNewTemplate(file, mainModel);
  };
  render() {
    const { classes } = this.props;
    return (
      <div>
        <div className={`${classes.generateStyle} BtnGroup`}>
          <Button
            className="BtnGroup-item"
            label={"Settings"}
            onclick={this.handleSettings}
          />
        </div>
        <div className={classes.buttonContainer}>
          <ReactFileReader
            handleFiles={(file) => {
              this.handleImportTemplate(file);
            }}
            fileTypes={[".json"]}
            multipleFiles={false}
          >
            <Button
              className={classes.btn}
              label={"Import"}
              icon={importIcon}
            />
          </ReactFileReader>
          <Button
            className={classes.btn}
            label={"Export"}
            icon={exportIcon}
            onclick={this.handleExportTemplate}
          />
        </div>
      </div>
    );
  }
}

GenerateSettings.propTypes = {};

const GenerateSettingsWrapper = injectSheet(styles)(GenerateSettings);

export default GenerateSettingsWrapper;
