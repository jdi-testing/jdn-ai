import React, { FC } from "react";
import Icon from "@ant-design/icons";

// import PageBigSvg from "../assets/page-big.svg";
import PageBigSvg from "./page-big.svg";
import { Footnote } from "../footnote/Footnote";

interface Props {
  children: React.ReactNode;
}

export const EmptyListInfo: FC<Props> = ({ children }) => {
  return (
    <div className="jdn__emptyList">
      <Icon component={PageBigSvg} />
      <Footnote>{children}</Footnote>
    </div>
  );
};
