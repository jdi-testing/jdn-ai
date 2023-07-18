import React, { FC } from "react";
import Icon from "@ant-design/icons";

import PageBigSvg from "./page-big.svg";
import { Typography } from "antd";

interface Props {
  children: React.ReactNode;
}

export const EmptyListInfo: FC<Props> = ({ children }) => {
  return (
    <div className="jdn__emptyList">
      <Icon component={PageBigSvg} />
      <Typography.Text>{children}</Typography.Text>
    </div>
  );
};
