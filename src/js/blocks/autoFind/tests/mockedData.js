export const perceptiontreshold = 0.9;
export const perceptiontresholdLow = 0.5;

export const mockResponseData = [
  {
    element_id: "9481017821757679104572477080",
    height: 154,
    predicted_label: "iframe",
    predicted_probability: 1,
    sort_key: 46816,
    width: 304,
    x: 240,
    y: 339
  },
  {
    element_id: "7332991229757679103311671466",
    height: 154,
    predicted_label: "iframe",
    predicted_probability: 1,
    sort_key: 46816,
    width: 304,
    x: 546.8021240234,
    y: 497
  },
  {
    element_id: "1840971479757679101719895076",
    height: 60,
    predicted_label: "link",
    predicted_probability: 0.5350476885,
    sort_key: 7311.2503051758,
    width: 121.8541717529,
    x: 287.4479370117,
    y: 0,
  },
  {
    element_id: "4830645298816310234842357051",
    height: 34,
    predicted_label: "button",
    predicted_probability: 0.7999940395,
    sort_key: 3388.6668395996,
    width: 99.6666717529,
    x: 457.3333435059,
    y: 1003.3333740234
  },
  {
    element_id: "9211668003816310239615632819",
    height: 12.6666669846,
    predicted_label: "checkbox",
    predicted_probability: 0.9945752621,
    sort_key: 160.4444524977,
    width: 12.6666669846,
    x: 240,
    y: 831.6666870117,
  }
];

// jdi_class_name
export const updatedElements = [
  {
    element_id: "9481017821757679104572477080",
    height: 154,
    predicted_label: "iframe",
    predicted_probability: 1,
    sort_key: 46816,
    width: 304,
    x: 240,
    y: 339,
    jdi_class_name: 'UIElement (iframe)'
  },
  {
    element_id: "7332991229757679103311671466",
    height: 154,
    predicted_label: "iframe",
    predicted_probability: 1,
    sort_key: 46816,
    width: 304,
    x: 546.8021240234,
    y: 497,
    jdi_class_name: 'UIElement (iframe)'
  },
  {
    element_id: "1840971479757679101719895076",
    height: 60,
    predicted_label: "link",
    predicted_probability: 0.54,
    sort_key: 7311.2503051758,
    width: 121.8541717529,
    x: 287.4479370117,
    y: 0,
    jdi_class_name: 'Link'
  },
  {
    element_id: "4830645298816310234842357051",
    height: 34,
    predicted_label: "button",
    predicted_probability: 0.8,
    sort_key: 3388.6668395996,
    width: 99.6666717529,
    x: 457.3333435059,
    y: 1003.3333740234,
    jdi_class_name: 'Button'
  },
  {
    element_id: "9211668003816310239615632819",
    height: 12.6666669846,
    predicted_label: "checkbox",
    predicted_probability: 0.99,
    sort_key: 160.4444524977,
    width: 12.6666669846,
    x: 240,
    y: 831.6666870117,
    jdi_class_name: 'Checkbox'
  }];

export const predictedAfterInteraction = updatedElements.map((el, index) => {
  if (index === 1) return { ...el, hidden: true };
  if (index === 3) return { ...el, skipGeneration: true };
  if (index === 4) return { ...el, skipGeneration: false };
  return el;
});

export const generationData = [
  {
    element_id: "9481017821757679104572477080",
    height: 154,
    predicted_label: "iframe",
    predicted_probability: 1,
    sort_key: 46816,
    width: 304,
    x: 240,
    y: 339,
    jdi_class_name: 'UIElement (iframe)',
    xpath: "//*[@id='frame']",
    attrId: "frame",
    predictedAttrId: "frame",
    tagName: "iframe"
  },
  {
    element_id: "7332991229757679103311671466",
    height: 154,
    predicted_label: "iframe",
    predicted_probability: 1,
    sort_key: 46816,
    width: 304,
    x: 546.8021240234,
    y: 497,
    jdi_class_name: 'UIElement (iframe)',
    xpath: "//*[@id='second_frame']",
    attrId: "second_frame",
    predictedAttrId: "secondFrame",
    tagName: "iframe"
  },
  {
    element_id: "1840971479757679101719895076",
    height: 60,
    predicted_label: "link",
    predicted_probability: 0.54,
    sort_key: 7311.2503051758,
    width: 121.8541717529,
    x: 287.4479370117,
    y: 0,
    jdi_class_name: 'Link',
    xpath: "//a[contains(text(), 'Metals & Colors')]",
    attrId: "",
    predictedAttrId: "",
    tagName: "a"
  },
  {
    element_id: "4830645298816310234842357051",
    height: 34,
    predicted_label: "button",
    predicted_probability: 0.8,
    sort_key: 3388.6668395996,
    width: 99.6666717529,
    x: 457.3333435059,
    y: 1003.3333740234,
    jdi_class_name: 'Button',
    xpath: "//*[contains(text(), 'Calculate')]",
    attrId: "",
    predictedAttrId: "",
    tagName: "button"
  },
  {
    element_id: "9211668003816310239615632819",
    height: 12.6666669846,
    predicted_label: "checkbox",
    predicted_probability: 0.99,
    sort_key: 160.4444524977,
    width: 12.6666669846,
    x: 240,
    y: 831.6666870117,
    jdi_class_name: 'Checkbox',
    xpath: "//*[@name='accept-conditions']",
    attrId: "accept-conditions",
    predictedAttrId: "acceptConditions",
    tagName: "input"
  }
];

export const interactedGenerationData = [generationData[0], generationData[2], generationData[4]];

export const abovePerception = generationData.filter((el) => el.predicted_probability >= perceptiontreshold);
