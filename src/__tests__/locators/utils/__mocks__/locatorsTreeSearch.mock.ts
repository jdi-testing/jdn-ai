import { LocatorType } from '../../../../common/types/common';
import { LocatorTaskStatus } from '../../../../features/locators/types/locator.types';

export const locatorsTreeMockSearch = [
  {
    depth: 0,
    searchState: 'hidden',
    elementId: '7967190244322359771369749968_0',
    is_shown: true,
    parent_id: '',
    jdnHash: '7967190244322359771369749968',
    locatorValue: {
      xPath: '/html/body/header/div/nav/ul[1]',
      cssSelector: '',
      taskStatus: LocatorTaskStatus.SUCCESS,
      errorMessage: '',
      output: '',
    },
    name: 'radiobuttonsUl',
    locatorType: LocatorType.xPath,
    message: '',
    predictedAttrId: '',
    predicted_label: 'radiogroup',
    pageObj: 0,
    isGenerated: true,
    tagName: 'ul',
    type: 'RadioButtons',
    isChecked: false,
    children: [
      {
        depth: 2,
        searchState: 'none',
        elementId: '9636042053322359773245578777_0',
        is_shown: true,
        parent_id: '4829071593322359778594168522',
        jdnHash: '9636042053322359773245578777',
        locatorValue: {
          xPath: '/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[5]/ul/li[5]',
          cssSelector: '',
          taskStatus: LocatorTaskStatus.PENDING,
          errorMessage: '',
          output: '',
        },
        name: 'breadcrumbsLi7',
        locatorType: LocatorType.xPath,
        message: '',
        predictedAttrId: '',
        predicted_label: 'breadcrumbs',
        pageObj: 0,
        isGenerated: true,
        tagName: 'li',
        type: 'Breadcrumbs',
        isChecked: false,
        children: [],
      },
    ],
  },
  {
    depth: 0,
    searchState: 'none',
    elementId: '796719024432235977136974900_0',
    is_shown: true,
    parent_id: '',
    jdnHash: '796719024432235977136974900',
    locatorValue: {
      xPath: '/html/body/header/div/nav/ul[1]',
      cssSelector: '',
      taskStatus: LocatorTaskStatus.PENDING,
      errorMessage: '',
      output: '',
    },
    name: 'radiobuttonsUl',
    locatorType: LocatorType.xPath,
    message: '',
    predictedAttrId: '',
    elemText: 'radioLi7',
    predicted_label: 'radiogroup',
    pageObj: 0,
    isGenerated: true,
    tagName: 'ul',
    type: 'RadioButtons',
    isChecked: false,
    children: [],
  },
];
