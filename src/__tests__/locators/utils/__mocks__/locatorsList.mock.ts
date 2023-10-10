import { LocatorTaskStatus, LocatorValidationErrorType } from '../../../../features/locators/types/locator.types';
import { MUIclasses } from '../../../../features/locators/types/muiClasses.types';

import { LocatorType } from '../../../../common/types/common';

export const locatorsListMock = [
  {
    element_id: '7967190244322359771369749968_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '',
    jdnHash: '7967190244322359771369749968',
    locator: {
      cssSelector: '',
      xPath: '/html/body/header/div/nav/ul[1]',
      taskStatus: LocatorTaskStatus.SUCCESS,
      errorMessage: '',
      output: '',
    },
    name: 'radiobuttonsUl',
    locatorType: LocatorType.xPath,
    predictedAttrId: '',
    predicted_label: 'radiogroup',
    message: '' as LocatorValidationErrorType,
    tagName: 'ul',
    type: MUIclasses.radiogroup,
    isChecked: false,
  },
  {
    element_id: '3969471880322359761484771163_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '7967190244322359771369749968',
    jdnHash: '3969471880322359761484771163',
    locator: {
      cssSelector: '',
      xPath: '/html/body/header/div/nav/div[2]',
      taskStatus: LocatorTaskStatus.SUCCESS,
      errorMessage: '',
      output: '',
    },
    name: 'buttonDiv',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'button',
    tagName: 'div',
    type: MUIclasses.button,
    isChecked: false,
  },
  {
    element_id: '0045220328322359764482356698_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '3969471880322359761484771163',
    jdnHash: '0045220328322359764482356698',
    locator: {
      cssSelector: '',
      xPath: '/html/body/header/div/nav/ul[1]/li[3]/a',
      taskStatus: LocatorTaskStatus.FAILURE,
      errorMessage: '',
      output: '',
    },
    name: 'textarea',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'textarea-autosize',
    tagName: 'a',
    type: MUIclasses['text-field'],
    isChecked: false,
  },
  {
    element_id: '6771529534322359778589411351_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '3969471880322359761484771163',
    jdnHash: '6771529534322359778589411351',
    locator: {
      cssSelector: '',
      xPath: '/html/body/footer/div/div/ul',
      taskStatus: LocatorTaskStatus.STARTED,
      errorMessage: '',
      output: '',
    },
    name: 'listUl',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'list',
    tagName: 'ul',
    type: MUIclasses.list,
    isChecked: false,
  },
  {
    element_id: '4899732051322359779677566872_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '7967190244322359771369749968',
    jdnHash: '4899732051322359779677566872',
    locator: {
      cssSelector: '',
      xPath: '/html/body/header/div/nav/ul[2]/li/a',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'link',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'link',
    tagName: 'a',
    type: MUIclasses.link,
    isChecked: false,
  },
  {
    element_id: '4829071593322359778594168519_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '4899732051322359779677566872',
    jdnHash: '4829071593322359778594168519',
    locator: {
      cssSelector: '',
      xPath: '/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[3]/ul/li[3]',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'anyName',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'breadcrumbs',
    tagName: 'li',
    type: MUIclasses.breadcrumbs,
    isChecked: false,
  },
  {
    element_id: '9636042053322359773245578788_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '4829071593322359778594168519',
    jdnHash: '9636042053322359773245578788',
    locator: {
      cssSelector: '',
      xPath: '/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[5]/ul/li[5]',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'breadcrumbsLi6',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'breadcrumbs',
    tagName: 'li',
    type: MUIclasses.breadcrumbs,
    isChecked: false,
  },
  {
    element_id: '8381553594322359777170267551_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '4829071593322359778594168519',
    jdnHash: '8381553594322359777170267551',
    locator: {
      cssSelector: '',
      xPath: '/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[3]/ul',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'breadcrumbsUl',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'breadcrumbs',
    tagName: 'ul',
    type: MUIclasses.breadcrumbs,
    isChecked: false,
  },
  {
    element_id: '4899732051322359779677566873_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '7967190244322359771369749968',
    jdnHash: '4899732051322359779677566873',
    locator: {
      cssSelector: '',
      xPath: '/html/body/header/div/nav/ul[2]/li/a',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'link',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'link',
    tagName: 'a',
    type: MUIclasses.link,
    isChecked: false,
  },
  {
    element_id: '4829071593322359778594168522_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '4899732051322359779677566873',
    jdnHash: '4829071593322359778594168522',
    locator: {
      cssSelector: '',
      xPath: '/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[3]/ul/li[3]',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'breadcrumbsLi2',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'breadcrumbs',
    tagName: 'li',
    type: MUIclasses.breadcrumbs,
    isChecked: false,
  },
  {
    element_id: '9636042053322359773245578777_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '4829071593322359778594168522',
    jdnHash: '9636042053322359773245578777',
    locator: {
      cssSelector: '',
      xPath: '/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[5]/ul/li[5]',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'breadcrumbsLi7',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'breadcrumbs',
    tagName: 'li',
    type: MUIclasses.breadcrumbs,
    isChecked: false,
  },
  {
    element_id: '8381553594322359777170267550_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '4829071593322359778594168522',
    jdnHash: '8381553594322359777170267550',
    locator: {
      cssSelector: '',
      xPath: '/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[3]/ul',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'breadcrumbsUl',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'breadcrumbs',
    tagName: 'ul',
    type: MUIclasses.breadcrumbs,
    isChecked: false,
  },
  {
    element_id: '796719024432235977136974900_0',
    is_shown: true,
    parent_id: '',
    jdnHash: '796719024432235977136974900',
    locator: {
      cssSelector: '',
      xPath: '/html/body/header/div/nav/ul[1]',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'radiobuttonsUl',
    locatorType: LocatorType.xPath,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    elemText: 'radioLi7',
    predicted_label: 'radiogroup',
    pageObj: 0,
    isGenerated: true,
    tagName: 'ul',
    type: MUIclasses.radiogroup,
    children: [],
    isChecked: false,
  },
];

export const locatorsListMockForVividus = [
  {
    element_id: '7967190244322359771369749968_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '',
    jdnHash: '7967190244322359771369749968',
    locator: {
      cssSelector: '',
      xPath: "//*[@index='5']//*[@index='8']/a",
      taskStatus: LocatorTaskStatus.SUCCESS,
      errorMessage: '',
      output: "//*[@index='5']//*[@index='8']/a",
    },
    name: 'materialUi',
    locatorType: LocatorType.xPath,
    predictedAttrId: '',
    predicted_label: 'radiogroup',
    message: '' as LocatorValidationErrorType,
    tagName: 'ul',
    type: 'Label',
    isChecked: false,
    poName: 'HomePage',
    vividusOutput: "variables.HomePage.Label.materialUi=By.xPath(//*[@index='5']//*[@index='8']/a)",
  },
  {
    element_id: '3969471880322359761484771163_0',
    is_shown: true,
    isGenerated: true,
    pageObj: 0,
    parent_id: '7967190244322359771369749968',
    jdnHash: '3969471880322359761484771163',
    locator: {
      cssSelector: "[role='menu'] > li:nth-child(7) > a",
      xPath: "//a[contains(text(), 'Table with pages')]",
      taskStatus: LocatorTaskStatus.SUCCESS,
      errorMessage: '',
      output: "[role='menu'] > li:nth-child(7) > a",
    },
    name: 'tableWithPages',
    locatorType: LocatorType.cssSelector,
    message: '' as LocatorValidationErrorType,
    predictedAttrId: '',
    predicted_label: 'button',
    tagName: 'div',
    type: 'Label',
    isChecked: false,
    poName: 'HomePage',
    vividusOutput: "variables.HomePage.Label.tableWithPages=By.cssSelector([role='menu'] > li:nth-child(7) > a)",
  },
];
