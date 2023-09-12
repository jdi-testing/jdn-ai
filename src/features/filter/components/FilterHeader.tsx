import { CloseOutlined } from "@ant-design/icons";
import { Button, Typography } from "antd";
import React from "react";

interface Props {
  onClickClose: () => void;
}

export const FilterHeader: React.FC<Props> = ({ onClickClose }) => (
  <div className="filter__header">
    <div className="ant-modal-title" id="rc_unique_0">
      <Typography.Text strong style={{ fontSize: "16px" }}>
        Filters
      </Typography.Text>
    </div>
    <Button type="text" shape="circle" icon={<CloseOutlined onClick={onClickClose} />} />
  </div>
);
