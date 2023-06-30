import React from "react";

import { EmptyListInfo } from "../../../common/components/emptyListInfo/EmptyListInfo";

export const PageObjectPlaceholder = () => {
  return (
    <EmptyListInfo>
      No page objects created
      <br />
      Open the desired page and click the &quot;+ Page object&quot; button to start
    </EmptyListInfo>
  );
};
