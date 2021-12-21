export const locators = [
  {
    attrId: "",
    element_id: "0955274655778840492142094709",
    height: 60,
    locator: {
      fullXpath: "/html/body/header/div/nav/ul[1]",
      taskStatus: "SUCCESS",
      robulaXpath: "//*[@class='uui-navigation nav navbar-nav m-l8']",
    },
    name: "listUl",
    predictedAttrId: "",
    predicted_label: "list",
    predicted_probability: 1,
    sort_key: 25223.1262207031,
    tagName: "ul",
    type: "list",
    width: 420.3854370117,
    x: 222.9375,
    y: 0,
  },
  {
    attrId: "",
    element_id: "2022378243778840502461724770",
    height: 15.3333339691,
    locator: {
      fullXpath: "/html/body/footer/div/div/ul",
      taskStatus: "SUCCESS",
      robulaXpath: "//*[@class='footer-menu']",
    },
    name: "listUl7",
    predictedAttrId: "",
    predicted_label: "list",
    predicted_probability: 1,
    sort_key: 2181.326557325,
    tagName: "ul",
    type: "list",
    width: 142.2604217529,
    x: 1037.7396240234,
    y: 1972.7917480469,
  },
  {
    attrId: "",
    element_id: "2713188863778840498565585241",
    height: 38.6666679382,
    locator: {
      fullXpath: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a",
      taskStatus: "REVOKED",
    },
    name: "badge",
    predictedAttrId: "",
    predicted_label: "badge",
    predicted_probability: 0.74,
    sort_key: 7733.3335876465,
    tagName: "a",
    type: "badge",
    width: 200,
    x: 0,
    y: 60,
  },
];

export const pageObject = `package io.github.jditesting.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import io.github.jditesting.sections.*;

public class HomePage extends WebPage {
    @UI("//*[@class='uui-navigation nav navbar-nav m-l8']") public list listUl;
    @UI("//*[@class='footer-menu']") public list listUl7;
    @UI("/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a") public badge badge;
}
`;

export const pageObjectCiryllic = `package io.github.jditesting.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import io.github.jditesting.sections.*;

public class DomashnyayaStranitsaPage extends WebPage {

}
`;


export const elements = [
  {
    "element_id": "8137667617863627491765611667",
    "x": 0,
    "y": 60,
    "width": 200,
    "height": 201.3333435059,
    "predicted_label": "radiogroup",
    "predicted_probability": 1,
    "sort_key": 40266.6687011719,
    "attrId": "",
    "predictedAttrId": "",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/div/div[1]/div/div[1]/div/div[1]/ul"
    }
  },
  {
    "element_id": "5970970438863627481080475679",
    "x": 222.9375,
    "y": 0,
    "width": 420.3854370117,
    "height": 60,
    "predicted_label": "list",
    "predicted_probability": 1,
    "sort_key": 25223.1262207031,
    "attrId": "",
    "predictedAttrId": "",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[1]"
    }
  },
  {
    "element_id": "6007858651863627495379467123",
    "x": 643.3229370117,
    "y": 0,
    "width": 164.5208435059,
    "height": 60,
    "predicted_label": "list",
    "predicted_probability": 1,
    "sort_key": 9871.2506103516,
    "attrId": "",
    "predictedAttrId": "",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[2]"
    }
  },
  {
    "element_id": "0162816257863627492169692261",
    "x": 0,
    "y": 182,
    "width": 200,
    "height": 38.6666679382,
    "predicted_label": "chip",
    "predicted_probability": 1,
    "sort_key": 7733.3335876465,
    "attrId": "",
    "predictedAttrId": "",
    "tagName": "a",
    "locator": {
      "fullXpath": "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[4]/a"
    }
  },
  {
    "element_id": "6625926239863627496637117374",
    "x": 0,
    "y": 60,
    "width": 200,
    "height": 38.6666679382,
    "predicted_label": "badge",
    "predicted_probability": 0.74,
    "sort_key": 7733.3335876465,
    "attrId": "",
    "predictedAttrId": "",
    "tagName": "a",
    "locator": {
      "fullXpath": "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a"
    }
  },
  {
    "element_id": "7306461754863627495404382489",
    "x": 0,
    "y": 100.6666717529,
    "width": 200,
    "height": 38.6666679382,
    "predicted_label": "chip",
    "predicted_probability": 1,
    "sort_key": 7733.3335876465,
    "attrId": "",
    "predictedAttrId": "",
    "tagName": "a",
    "locator": {
      "fullXpath": "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[2]/a"
    }
  },
  {
    "element_id": "8591186228863627484233270436",
    "x": 409.3020935059,
    "y": 0,
    "width": 93.5416717529,
    "height": 60,
    "predicted_label": "badge",
    "predicted_probability": 0.96,
    "sort_key": 5612.5003051758,
    "attrId": "",
    "predictedAttrId": "",
    "tagName": "a",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[1]/li[3]/a"
    }
  },
  {
    "element_id": "4605919800863627493524152551",
    "x": 1037.7396240234,
    "y": 1972.7917480469,
    "width": 142.2604217529,
    "height": 15.3333339691,
    "predicted_label": "list",
    "predicted_probability": 1,
    "sort_key": 2181.326557325,
    "attrId": "",
    "predictedAttrId": "",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/footer/div/div/ul"
    }
  }
];
