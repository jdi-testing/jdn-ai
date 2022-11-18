import { X } from "phosphor-react";
import * as React from "react";
import { Footnote } from "./footnote/Footnote";

interface Props {
  hidden: boolean;
  primaryLabel: string;
  secondaryLabel: string;
  onDelete: React.MouseEventHandler<HTMLSpanElement>
}

export const Chip: React.FC<Props> = ({ hidden, primaryLabel, secondaryLabel, onDelete }) => {
  return (
    <div className="ant-select ant-select-multiple" style={{ display: `${hidden ? "none" : "inline-block"}` }}>
      <div className="ant-select-selection-overflow-item" style={{ opacity: 1 }}>
        <span className="ant-select-selection-item">
          <span className="ant-select-selection-item-content">
            <Footnote>{`${primaryLabel} ${secondaryLabel}`}</Footnote>
          </span>
          <span
            className="ant-select-selection-item-remove"
            unselectable="on"
            aria-hidden="true"
            style={{ userSelect: "none" }}
          >
            <span role="img" aria-label="close" className="anticon anticon-close" onClick={onDelete}>
              <X size={12} color="#00000073" />
            </span>
          </span>
        </span>
      </div>
    </div>
  );
};
