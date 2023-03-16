import { LocatorType } from "../../../common/types/locatorType";
import { PageObject } from "../../../features/pageObjects/types/pageObjectSlice.types";

export const pageObject0 = {
  id: 0,
  name: "HomePage",
  url: "https://jdi-testing.github.io/jdi-light/index.html",
  library: "MUI",
  pathname: "/jdi-light/index.html",
  search: "",
  origin: "https://jdi-testing.github.io",
  pageData: "",
  locators: ["7524916072510597399809892823_0", "2075611903510597386448924232_0", "4138940493550098806301857686_0"],
};

export const pageObjectXpath = {
  id: 0,
  name: "HomePage",
  url: "https://jdi-testing.github.io/jdi-light/index.html",
  library: "MUI",
  pathname: "/jdi-light/index.html",
  search: "",
  origin: "https://jdi-testing.github.io",
  pageData: "",
  locatorType: LocatorType.xPath,
  locators: ["7524916072510597399809892823_0", "2075611903510597386448924232_0", "4138940493550098806301857686_0"],
};

export const pageObjectCssSelector = {
  id: 0,
  name: "HomePage",
  url: "https://jdi-testing.github.io/jdi-light/index.html",
  library: "MUI",
  pathname: "/jdi-light/index.html",
  search: "",
  origin: "https://jdi-testing.github.io",
  pageData: "",
  locatorType: LocatorType.cssSelector,
  locators: ["7524916072510597399809892823_0", "2075611903510597386448924232_0", "4138940493550098806301857686_0"],
};

export const state = (_pageObject: PageObject) => ({
  pageObject: {
    past: [],
    future: [],
    present: {
      currentPageObject: 0,
      entities: { 0: _pageObject },
      ids: [0],
    },
  },
  locators: {
    past: [],
    future: [],
    present: {
      entities: {
        "7524916072510597399809892823_0": {
          element_id: "7524916072510597399809892823_0",
          predicted_label: "dialog",
          jdnHash: "7524916072510597399809892823",
          pageObj: 0,
          elemName: "",
          elemId: "",
          elemText:
            "\n                EPAM framework Wishes…\n\n                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\n                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud\n                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in\n                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\t\t\t\tJDI Github\n                \n\t\t\t\t  <p>Your browser does not support iframes.</p>\n\t\t\t\t\n\t\t\t\t\n                    \n\t\t\t\t\t  <p>Your browser does not support iframes.</p>\n\t\t\t\t\t\n                    \n\t\t\t\t\t  <p>Your browser does not support iframes.</p>\n\t\t\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\t  <p>Your browser does not support iframes.</p>\n\t\t\t\t\n                \n                    \n                        \n                            \n                                \n                            \n                            To include good practicesand ideas from successfulEPAM project\n                        \n                    \n                    \n                        \n                            \n                                \n                            \n                            To be flexible andcustomizable \n                        \n                    \n                    \n                        \n                            \n                                \n                            \n                            To be multiplatform \n                        \n                    \n                    \n                        \n                            \n                                \n                            \n                            Already have good base(about 20 internal andsome external projects),wish to get more…\n                        \n                    \n                \n            ",
          elemAriaLabel: null,
          locator: {
            fullXpath: "/html/body/div/div[2]/main/div[2]",
            taskStatus: "SUCCESS",
            robulaXpath: "//*[@class='main-content']",
          },
          locatorType: LocatorType.cssSelector,
          name: "dialog",
          type: "Dialog",
          parent_id: "",
          children: [],
          active: false,
        },
        "2075611903510597386448924232_0": {
          element_id: "2075611903510597386448924232_0",
          predicted_label: "list",
          jdnHash: "2075611903510597386448924232",
          pageObj: 0,
          elemName: "",
          elemId: "",
          elemText:
            "                                    Home                                                    Contact form                                                     Service                                                                                        Support                        Dates                        Search                        Complex Table                         Simple Table                         User Table                         Table with pages                        Different elements\t\t\t\t\t\tPerformance                                                                        Metals & Colors                            ",
          elemAriaLabel: null,
          locator: {
            fullXpath: "/html/body/header/div/nav/ul[1]",
            taskStatus: "SUCCESS",
            robulaXpath: "//*[@class='uui-navigation nav navbar-nav m-l8']",
            customXpath: "//*[@class='uui-navigation nav navbar-nav m-l8 any']",
          },
          name: "homeContactFormServiceSupportDatesSearchComplexTableSimpleTa",
          type: "List",
          parent_id: "",
          children: ["3365961729510597382209820079_0", "5642356970510597386143211636_0"],
          active: true,
          validity: {
            locator: "The locator was not found on the page.",
          },
          isCustomName: false,
          isCustomLocator: true,
          generate: true,
        },
        "4138940493550098806301857686_0": {
          element_id: "4138940493550098806301857686_0",
          predicted_label: "menu",
          jdnHash: "4138940493550098806301857686",
          pageObj: 0,
          elemName: "",
          elemId: "",
          elemText:
            "                                            HTML 5                                                                Mobile and HTML 5                                                                Bootstrap                                                                Bootstrap form                                                                Bootstrap forms                                                                React Ant                                                                Angular                                                                Material UI                                                                Vuetify                                    ",
          elemAriaLabel: null,
          locator: {
            fullXpath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[5]/ul",
            taskStatus: "SUCCESS",
            robulaXpath: "//*[@index='5']/ul",
          },
          locatorType: LocatorType.xPath,
          name: "html5MobileAndHtml5BootstrapBootstrapFormBootstrapFormsReact",
          type: "Menu",
          parent_id: "",
          children: [],
          generate: true,
        },
      },
      ids: ["7524916072510597399809892823_0", "2075611903510597386448924232_0", "4138940493550098806301857686_0"],
    },
  },
});

export const result = (pageObject: PageObject) => [
  {
    element_id: "7524916072510597399809892823_0",
    predicted_label: "dialog",
    jdnHash: "7524916072510597399809892823",
    pageObj: 0,
    elemName: "",
    elemId: "",
    elemText:
      "\n                EPAM framework Wishes…\n\n                Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod\n                    tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud\n                    exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat Duis aute irure dolor in\n                    reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.\n\t\t\t\tJDI Github\n                \n\t\t\t\t  <p>Your browser does not support iframes.</p>\n\t\t\t\t\n\t\t\t\t\n                    \n\t\t\t\t\t  <p>Your browser does not support iframes.</p>\n\t\t\t\t\t\n                    \n\t\t\t\t\t  <p>Your browser does not support iframes.</p>\n\t\t\t\t\t\n\t\t\t\t\n\t\t\t\t\n\t\t\t\t  <p>Your browser does not support iframes.</p>\n\t\t\t\t\n                \n                    \n                        \n                            \n                                \n                            \n                            To include good practicesand ideas from successfulEPAM project\n                        \n                    \n                    \n                        \n                            \n                                \n                            \n                            To be flexible andcustomizable \n                        \n                    \n                    \n                        \n                            \n                                \n                            \n                            To be multiplatform \n                        \n                    \n                    \n                        \n                            \n                                \n                            \n                            Already have good base(about 20 internal andsome external projects),wish to get more…\n                        \n                    \n                \n            ",
    elemAriaLabel: null,
    locator: {
      fullXpath: "/html/body/div/div[2]/main/div[2]",
      taskStatus: "SUCCESS",
      robulaXpath: "//*[@class='main-content']",
      output: ".main-content",
    },
    locatorType: LocatorType.cssSelector,
    name: "dialog",
    type: "Dialog",
    parent_id: "",
    children: [],
    active: false,
  },
  {
    element_id: "2075611903510597386448924232_0",
    predicted_label: "list",
    jdnHash: "2075611903510597386448924232",
    pageObj: 0,
    elemName: "",
    elemId: "",
    elemText:
      "                                    Home                                                    Contact form                                                     Service                                                                                        Support                        Dates                        Search                        Complex Table                         Simple Table                         User Table                         Table with pages                        Different elements\t\t\t\t\t\tPerformance                                                                        Metals & Colors                            ",
    elemAriaLabel: null,
    locator: {
      fullXpath: "/html/body/header/div/nav/ul[1]",
      taskStatus: "SUCCESS",
      robulaXpath: "//*[@class='uui-navigation nav navbar-nav m-l8']",
      customXpath: "//*[@class='uui-navigation nav navbar-nav m-l8 any']",
      output:
        pageObject.locatorType === LocatorType.cssSelector
          ? ".uui-navigation.nav.navbar-nav.m-l8.any"
          : "//*[@class='uui-navigation nav navbar-nav m-l8 any']",
    },
    name: "homeContactFormServiceSupportDatesSearchComplexTableSimpleTa",
    type: "List",
    parent_id: "",
    children: ["3365961729510597382209820079_0", "5642356970510597386143211636_0"],
    active: true,
    validity: {
      locator: "The locator was not found on the page.",
    },
    isCustomName: false,
    isCustomLocator: true,
    generate: true,
  },
  {
    element_id: "4138940493550098806301857686_0",
    predicted_label: "menu",
    jdnHash: "4138940493550098806301857686",
    pageObj: 0,
    elemName: "",
    elemId: "",
    elemText:
      "                                            HTML 5                                                                Mobile and HTML 5                                                                Bootstrap                                                                Bootstrap form                                                                Bootstrap forms                                                                React Ant                                                                Angular                                                                Material UI                                                                Vuetify                                    ",
    elemAriaLabel: null,
    locator: {
      fullXpath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[5]/ul",
      taskStatus: "SUCCESS",
      robulaXpath: "//*[@index='5']/ul",
      output: "//*[@index='5']/ul",
    },
    locatorType: LocatorType.xPath,
    name: "html5MobileAndHtml5BootstrapBootstrapFormBootstrapFormsReact",
    type: "Menu",
    parent_id: "",
    children: [],
    generate: true,
  },
];
