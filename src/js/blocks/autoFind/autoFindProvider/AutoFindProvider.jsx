/* eslint-disable indent */
import { filter } from "lodash";
import React from "react";
import { inject, observer } from "mobx-react";
import { useContext } from "react";
import { generatePageObject } from "./../utils/pageDataHandlers";

export const autoFindStatus = {
  noStatus: "",
  loading: "Loading...",
  success: "Successful!",
  removed: "Removed",
  error: "An error occured",
  blocked: "Script is blocked. Close all popups",
};

export const xpathGenerationStatus = {
  noStatus: "",
  started: "XPath generation is running in background...",
  complete: "XPathes generation is successfully completed",
};

const AutoFindContext = React.createContext();

const AutoFindProvider = inject("mainModel")(
  observer(({ mainModel, children }) => {
    const generateAndDownload = (locators) => {
      generatePageObject(
        filter(locators, (loc) => loc.generate && !loc.deleted),
        mainModel
      );
    };

    const data = [
      {},
      {
        generateAndDownload,
      },
    ];

    return <AutoFindContext.Provider value={data}>{children}</AutoFindContext.Provider>;
  })
);

const useAutoFind = () => {
  const context = useContext(AutoFindContext);
  if (context === void 0) {
    throw new Error("useAutoFind can only be used inside AutoFindProvider");
  }
  return context;
};

export { AutoFindProvider, useAutoFind };
