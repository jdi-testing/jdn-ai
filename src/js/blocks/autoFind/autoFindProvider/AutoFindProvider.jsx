/* eslint-disable indent */
import { filter } from "lodash";
import React from "react";
import { inject, observer } from "mobx-react";
import { useContext } from "react";
import { openDownloadPopup } from "./../utils/pageDataHandlers";
import { locatorTaskStatus } from "./../utils/locatorGenerationController";
import { generatePageObject } from "../utils/pageObject";

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

const hasNotGeneratedLocators = (locators) => locators.some((loc) => {
  return loc.locator.taskStatus === locatorTaskStatus.STARTED ||
    loc.locator.taskStatus === locatorTaskStatus.PENDING;
});

const AutoFindContext = React.createContext();

const AutoFindProvider = inject("mainModel")(
  observer(({ mainModel, children }) => {
    const generateAllLocators = (locators) => generatePageObject(
      filter(locators, (loc) => !loc.deleted),
      mainModel
    );

    const generateAndDownload = (locators) => {
      if (hasNotGeneratedLocators(locators)) {
        openDownloadPopup();
      } else {
        generateAllLocators(locators);
      }
    };

    const data = [
      {},
      {
        generateAndDownload,
        generateAllLocators
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
