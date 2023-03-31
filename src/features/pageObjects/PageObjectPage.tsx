import React from "react";
import { PageObjList } from "./components/PageObjList";

interface Props {
  template?: Blob;
}

export const PageObjectPage: React.FC<Props> = (props) => {
  return (
    <div className="jdn__pageObject">
      <PageObjList {...props} />
    </div>
  );
};
