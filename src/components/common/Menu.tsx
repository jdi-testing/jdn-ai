import React, { ReactNode } from "react";
import { Menu as AntMenu } from "antd";

export interface MenuItem {
  key: string;
  icon?: ReactNode;
  onClick: (() => void) | undefined;
  label: ReactNode;
}

interface Props {
  items: MenuItem[];
}

export const Menu: React.FC<Props> = ({ items }) => {
  return (
    <AntMenu>
      {items.map((item) => {
        const { label, ...rest } = item;
        return <AntMenu.Item {...rest}>{label}</AntMenu.Item>;
      })}
    </AntMenu>
  );
};
