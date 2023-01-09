import { ReactNode } from "react";

export interface MenuItem {
  key: string;
  icon?: ReactNode;
  onClick?: (() => void) | undefined;
  label: ReactNode;
  children?: MenuItem[];
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
