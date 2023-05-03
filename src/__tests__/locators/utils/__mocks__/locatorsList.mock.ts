import { LocatorTaskStatus } from "../../../../features/locators/types/locator.types";
import { MUIclasses } from "../../../../features/locators/types/muiClasses.types";
import { LocatorValidationErrorType } from "../../../../features/locators/types/locator.types";
import { LocatorType } from "../../../../common/types/common";

export const locatorsListMock = [
  {
    element_id: "7967190244322359771369749968_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "",
    jdnHash: "7967190244322359771369749968",
    locator: {
      cssSelector: null,
      xPath: "/html/body/header/div/nav/ul[1]",
      taskStatus: LocatorTaskStatus.SUCCESS,
      errorMessage: "",
      output: "",
    },
    name: "radiobuttonsUl",
    predictedAttrId: "",
    predicted_label: "radiogroup",
    message: "" as LocatorValidationErrorType,
    tagName: "ul",
    type: MUIclasses.radiogroup,
  },
  {
    element_id: "3969471880322359761484771163_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "7967190244322359771369749968",
    jdnHash: "3969471880322359761484771163",
    locator: {
      cssSelector: null,
      xPath: "/html/body/header/div/nav/div[2]",
      taskStatus: LocatorTaskStatus.SUCCESS,
      errorMessage: "",
      output: "",
    },
    name: "buttonDiv",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "button",
    tagName: "div",
    type: MUIclasses.button,
  },
  {
    element_id: "0045220328322359764482356698_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "3969471880322359761484771163",
    jdnHash: "0045220328322359764482356698",
    locator: {
      cssSelector: null,
      xPath: "/html/body/header/div/nav/ul[1]/li[3]/a",
      taskStatus: LocatorTaskStatus.FAILURE,
      errorMessage: "",
      output: "",
    },
    name: "textarea",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "textarea-autosize",
    tagName: "a",
    type: MUIclasses["text-field"],
  },
  {
    element_id: "6771529534322359778589411351_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "3969471880322359761484771163",
    jdnHash: "6771529534322359778589411351",
    locator: {
      cssSelector: null,
      xPath: "/html/body/footer/div/div/ul",
      taskStatus: LocatorTaskStatus.STARTED,
      errorMessage: "",
      output: "",
    },
    name: "listUl",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "list",
    tagName: "ul",
    type: MUIclasses.list,
  },
  {
    element_id: "4899732051322359779677566872_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "7967190244322359771369749968",
    jdnHash: "4899732051322359779677566872",
    locator: {
      cssSelector: null,
      xPath: "/html/body/header/div/nav/ul[2]/li/a",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "link",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "link",
    tagName: "a",
    type: MUIclasses.link,
  },
  {
    element_id: "4829071593322359778594168519_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "4899732051322359779677566872",
    jdnHash: "4829071593322359778594168519",
    locator: {
      cssSelector: null,
      xPath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[3]/ul/li[3]",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "anyName",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "breadcrumbs",
    tagName: "li",
    type: MUIclasses.breadcrumbs,
  },
  {
    element_id: "9636042053322359773245578788_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "4829071593322359778594168519",
    jdnHash: "9636042053322359773245578788",
    locator: {
      cssSelector: null,
      xPath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[5]/ul/li[5]",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "breadcrumbsLi6",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "breadcrumbs",
    tagName: "li",
    type: MUIclasses.breadcrumbs,
  },
  {
    element_id: "8381553594322359777170267551_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "4829071593322359778594168519",
    jdnHash: "8381553594322359777170267551",
    locator: {
      cssSelector: null,
      xPath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[3]/ul",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "breadcrumbsUl",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "breadcrumbs",
    tagName: "ul",
    type: MUIclasses.breadcrumbs,
  },
  {
    element_id: "4899732051322359779677566873_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "7967190244322359771369749968",
    jdnHash: "4899732051322359779677566873",
    locator: {
      cssSelector: null,
      xPath: "/html/body/header/div/nav/ul[2]/li/a",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "link",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "link",
    tagName: "a",
    type: MUIclasses.link,
  },
  {
    element_id: "4829071593322359778594168522_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "4899732051322359779677566873",
    jdnHash: "4829071593322359778594168522",
    locator: {
      cssSelector: null,
      xPath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[3]/ul/li[3]",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "breadcrumbsLi2",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "breadcrumbs",
    tagName: "li",
    type: MUIclasses.breadcrumbs,
  },
  {
    element_id: "9636042053322359773245578777_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "4829071593322359778594168522",
    jdnHash: "9636042053322359773245578777",
    locator: {
      cssSelector: null,
      xPath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[5]/ul/li[5]",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "breadcrumbsLi7",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "breadcrumbs",
    tagName: "li",
    type: MUIclasses.breadcrumbs,
  },
  {
    element_id: "8381553594322359777170267550_0",
    generate: true,
    pageObj: 0,
    locatorType: LocatorType.xPath,
    parent_id: "4829071593322359778594168522",
    jdnHash: "8381553594322359777170267550",
    locator: {
      cssSelector: null,
      xPath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[3]/ul",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "breadcrumbsUl",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    predicted_label: "breadcrumbs",
    tagName: "ul",
    type: MUIclasses.breadcrumbs,
  },
  {
    element_id: "796719024432235977136974900_0",
    parent_id: "",
    jdnHash: "796719024432235977136974900",
    locator: {
      cssSelector: null,
      xPath: "/html/body/header/div/nav/ul[1]",
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: "",
      output: "",
    },
    name: "radiobuttonsUl",
    message: "" as LocatorValidationErrorType,
    predictedAttrId: "",
    elemText: "radioLi7",
    predicted_label: "radiogroup",
    pageObj: 0,
    locatorType: LocatorType.xPath,
    generate: true,
    tagName: "ul",
    type: MUIclasses.radiogroup,
    children: [],
  },
];
