import { Button } from "antd";
import React from "react";
import Icon from "@ant-design/icons";

import ErrorIcon from "../../assets/error.svg";
import RestoreIcon from "../../assets/restore.svg";

export const SeveralTabsWarning = ({ checkSession }) => {
  return (
    <div className="jdn__severalTabsWarning">
      <div className="jdn__severalTabsWarning-icon">
        <ErrorIcon width="20px" height="20px" />
      </div>
      <div className="jdn__severalTabsWarning-text">
        <span>
          <h1>You can use the plugin only within 1 tab!</h1>
          <p>The plugin is open in several tabs now. Please leave 1 plugin tab open and continue working in it.</p>
        </span>
        <Button danger ghost onClick={checkSession}>
          <Icon component={RestoreIcon} />
          Retry
        </Button>
      </div>
    </div>
  );
};
