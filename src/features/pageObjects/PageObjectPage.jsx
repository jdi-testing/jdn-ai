import React from "react";
import { PageObjList } from "../pageObjects/PageObjList";

export const PageObjectPage = (props) => {
  return (
    <div className="jdn__pageObject">
      <PageObjList {...props} />
    </div>
  );
};
