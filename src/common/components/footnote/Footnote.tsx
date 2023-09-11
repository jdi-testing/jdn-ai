import { Typography } from "antd";
import React from "react";

interface Props {
  children: React.ReactNode;
  className?: string;
}

export const Footnote: React.FC<Props> = ({ children, className = "" }) => {
  return <Typography.Text className={`jdn__footnote ${className}`}>{children}</Typography.Text>;
};
