import React from "react";
import Unreachable from "../assets/unreachable.svg";

export const SeveralTabsWarning = () => {
  return (
    <div className="jdn__severalTabsWarning">
      <div className="jdn__severalTabsWarning-icon">
        <Unreachable width="20px" height="20px"/>
      </div>
      <div className="jdn__severalTabsWarning-text">
        <h1>You can use the plugin only within 1 tab!</h1>
        <p>
          The plugin is open in several tabs now.
          Please leave 1 plugin tab open and continue working in it.
        </p>
      </div>
    </div>
  );
};
