import React, { ReactNode } from "react";
import { Menu as AntMenu } from "antd";

export interface MenuItem {
  key: string;
  icon?: ReactNode;
  onClick?: (() => void) | undefined;
  label: ReactNode;
  children?: MenuItem[];
}

interface Props {
  items: MenuItem[];
}

export const getItem = (
  key: string,
  label: ReactNode,
  onClick?: () => void,
  icon?: ReactNode,
  children?: MenuItem[]
): MenuItem => ({
  key,
  label,
  onClick,
  icon,
  children,
});

export const Menu: React.FC<Props> = ({ items }) => {
  return <AntMenu onClick={({ domEvent }) => domEvent.stopPropagation()} {...{ items }} />;
};
