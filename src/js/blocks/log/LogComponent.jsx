import React from "react";
import injectSheet from "react-jss";
import { inject, observer } from "mobx-react";
import PropTypes from "prop-types";
import { errorIcon, successIcon, warningIcon } from "../../../icons/index";

const styles = {
  buttonContainer: {
    margin: "20px 0",
  },
  btn: {
    marginRight: "5px",
  },
  list: {
    paddingLeft: "15px",
    display: "block",
  },
  link: {
    color: "black",
    cursor: "pointer",
  },

  logContainer: {
    position: "fixed",
    height: "50px",
    width: "50px",
    right: 10,
    bottom: 10,
    cursor: "pointer",
    textAlign: "center",
    paddingTop: "5px",
  },

  logContainerExpand: {
    height: "100%",
    width: "100%",
  },
  logIcon: {
    width: "35px",
    height: "35px",
  },
  logItemContainer: {
    display: "flex"
  },
  logItem: {
    marginLeft: "10px",
  },
};

@inject("mainModel")
@observer
class LogComponent extends React.Component {
  triggerShow = () => {
    const { mainModel } = this.props;
    mainModel.triggerShowLog();
  };

  displayLogIcon = () => {
    const { mainModel, classes } = this.props;
    const findError = mainModel.applicationLog.find(
      (logItem) => logItem.type === "error"
    );
    const findWarn = mainModel.applicationLog.find(
      (logItem) => logItem.type === "warning"
    );
    const findSuccess = mainModel.applicationLog.find(
      (logItem) => logItem.type === "success"
    );
    let icon;

    if (findSuccess) {
      icon = successIcon;
    }
    if (findWarn) {
      icon = warningIcon;
    }
    if (findError) {
      icon = errorIcon;
    }
    if (icon) {
      return <img className={classes.logIcon} src={icon} />;
    }
    return <p>Empty Log</p>;
  };

  displayLogItem = (item) => {
    const { classes } = this.props;
    let time;
    if (item.time) {
      time = `${item.time.getHours()}:${item.time.getMinutes()}:${item.time.getSeconds()}:${item.time.getMilliseconds()}`;
    }
    return (
      <div className={classes.logItemContainer}>
        <p className={classes.logItem}>{time}</p>
        <p className={classes.logItem}>{item.message}</p>
      </div>
    );
  };

  render() {
    const { classes, mainModel } = this.props;

    return (
      <div className={classes.logContainerExpand} onClick={this.triggerShow}>
        {mainModel.applicationLog.map((item, index) => (
          <div key={item.message + index}>{this.displayLogItem(item)}</div>
        ))}
      </div>
    );
  }
}

LogComponent.propTypes = {};

const LogComponentWrapper = injectSheet(styles)(LogComponent);

export default LogComponentWrapper;
