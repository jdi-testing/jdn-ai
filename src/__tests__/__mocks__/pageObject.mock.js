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

export const pageObject = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;

import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;
import com.epam.jdi.light.material.elements.displaydata.*;
import com.epam.jdi.light.material.elements.displaydata.table.*;
import com.epam.jdi.light.material.elements.feedback.*;
import com.epam.jdi.light.material.elements.feedback.progress.*;
import com.epam.jdi.light.material.elements.inputs.*;
import com.epam.jdi.light.material.elements.inputs.transferlist.*;
import com.epam.jdi.light.material.elements.layout.*;
import com.epam.jdi.light.material.elements.navigation.*;
import com.epam.jdi.light.material.elements.navigation.steppers.*;
import com.epam.jdi.light.material.elements.surfaces.*;
import com.epam.jdi.light.material.elements.utils.*;

public class HomePage extends WebPage {
    @UI("//*[@class='uui-navigation nav navbar-nav m-l8']")
    public list listUl;

    @UI("//*[@class='footer-menu']")
    public list listUl7;

    @UI("/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a")
    public badge badge;
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


export const elementsWithoutNames = [
  {
    "element_id": "7824983223872788250093302805",
    "x": 0,
    "y": 59.9999389648,
    "width": 200,
    "height": 201.3333435059,
    "predicted_label": "radiogroup",
    "predicted_probability": 1,
    "sort_key": 40266.6687011719,
    "predictedAttrId": "",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/div/div[1]/div/div[1]/div/div[1]/ul"
    }
  },
  {
    "element_id": "3976799717872788243800691939",
    "x": 222.9375,
    "y": -0.0000610352,
    "width": 420.3854370117,
    "height": 60,
    "predicted_label": "list",
    "predicted_probability": 1,
    "sort_key": 25223.1262207031,
    "predictedAttrId": "",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[1]"
    }
  },
  {
    "element_id": "2531946027872788259730157905",
    "x": 643.3229370117,
    "y": -0.0000610352,
    "width": 164.5208435059,
    "height": 60,
    "predicted_label": "list",
    "predicted_probability": 1,
    "sort_key": 9871.2506103516,
    "predictedAttrId": "",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[2]"
    }
  },
  {
    "element_id": "1788878284872788254954433922",
    "x": 0,
    "y": 59.9999389648,
    "width": 200,
    "height": 38.6666679382,
    "predicted_label": "badge",
    "predicted_probability": 0.74,
    "sort_key": 7733.3335876465,
    "predictedAttrId": "",
    "tagName": "a",
    "locator": {
      "fullXpath": "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a"
    }
  },
  {
    "element_id": "8073262067872788257041578300",
    "x": 0,
    "y": 100.6666259766,
    "width": 200,
    "height": 38.6666679382,
    "predicted_label": "chip",
    "predicted_probability": 1,
    "sort_key": 7733.3335876465,
    "predictedAttrId": "",
    "tagName": "a",
    "locator": {
      "fullXpath": "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[2]/a"
    }
  },
  {
    "element_id": "8162387396872788255600213565",
    "x": 0,
    "y": 181.9999389648,
    "width": 200,
    "height": 38.6666679382,
    "predicted_label": "chip",
    "predicted_probability": 1,
    "sort_key": 7733.3335876465,
    "predictedAttrId": "",
    "tagName": "a",
    "locator": {
      "fullXpath": "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[4]/a"
    }
  },
  {
    "element_id": "3824832072872788248203820469",
    "x": 409.3020935059,
    "y": -0.0000610352,
    "width": 93.5416717529,
    "height": 60,
    "predicted_label": "badge",
    "predicted_probability": 0.83,
    "sort_key": 5612.5003051758,
    "predictedAttrId": "",
    "tagName": "a",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[1]/li[3]/a"
    }
  },
  {
    "element_id": "1195797979872788259469412332",
    "x": 1037.7396240234,
    "y": 1972.7916870117,
    "width": 142.2604217529,
    "height": 15.3333339691,
    "predicted_label": "list",
    "predicted_probability": 1,
    "sort_key": 2181.326557325,
    "predictedAttrId": "",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/footer/div/div/ul"
    }
  },
  {
    "element_id": "3265985627872788257228708643",
    "x": 0,
    "y": 709.3333129883,
    "width": 0,
    "height": 0,
    "predicted_label": "button",
    "predicted_probability": 1,
    "sort_key": 0,
    "predictedAttrId": "1001button",
    "tagName": "button",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[2]/li/div/div/button"
    }
  },
  {
    "element_id": "3901491381872788252561828171",
    "x": 0,
    "y": 709.3333129883,
    "width": 0,
    "height": 0,
    "predicted_label": "button",
    "predicted_probability": 1,
    "sort_key": 0,
    "predictedAttrId": "loginButton",
    "tagName": "button",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[2]/li/div/form/button"
    }
  },
  {
    "element_id": "9384531537872788240323543297",
    "x": 0,
    "y": 709.3333129883,
    "width": 0,
    "height": 0,
    "predicted_label": "menu",
    "predicted_probability": 1,
    "sort_key": 0,
    "predictedAttrId": "   menu Foo  ",
    "tagName": "ul",
    "locator": {
      "fullXpath": "/html/body/header/div/nav/ul[1]/li[3]/ul"
    }
  }
];

export const elementsWithNames = [
  {
    ...elementsWithoutNames[0],
    "name": "radiobuttonsUl",
    "type": "RadioButtons",
  },
  {
    ...elementsWithoutNames[1],
    "name": "listsUl",
    "type": "List",
  },
  {
    ...elementsWithoutNames[2],
    "name": "listsUl2",
    "type": "List",
  },
  {
    ...elementsWithoutNames[3],
    "name": "badge",
    "type": "Badge",
  },
  {
    ...elementsWithoutNames[4],
    "name": "chip",
    "type": "Chip",
  },
  {
    ...elementsWithoutNames[5],
    "name": "chip5",
    "type": "Chip",
  },
  {
    ...elementsWithoutNames[6],
    "name": "badge6",
    "type": "Badge",
  },
  {
    ...elementsWithoutNames[7],
    "name": "listsUl7",
    "type": "List",
  },
  {
    ...elementsWithoutNames[8],
    "name": "name1001button",
    "type": "Button",
  },
  {
    ...elementsWithoutNames[9],
    "name": "loginButton",
    "type": "Button",
  },
  {
    ...elementsWithoutNames[10],
    "name": "menuFoo",
    "type": "Menu",
  }
];
