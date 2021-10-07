import React from "react";

import CloseSVG from "../../../../../icons/close.svg";

export const Chip = ({ hidden, primaryLabel, secondaryLabel, onDelete }) => {
  return (
    <div className="ant-select ant-select-multiple" style={{ display: `${hidden ? "none" : "inline-block"}` }}>
      <div className="ant-select-selection-overflow-item" style={{ opacity: 1 }}>
        <span className="ant-select-selection-item" title="c12">
          <span className="ant-select-selection-item-content">
            {primaryLabel} <span className="">{secondaryLabel}</span>
          </span>
          <span
            className="ant-select-selection-item-remove"
            unselectable="on"
            aria-hidden="true"
            style={{ userSelect: "none" }}
          >
            <span role="img" aria-label="close" className="anticon anticon-close" onClick={onDelete}>
              <svg
                viewBox="64 64 896 896"
                focusable="false"
                data-icon="close"
                width="1em"
                height="1em"
                fill="currentColor"
                aria-hidden="true"
              >
                <CloseSVG />
              </svg>
            </span>
          </span>
        </span>
      </div>
    </div>
  );
};
