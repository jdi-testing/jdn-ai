import { AnnotationType } from "../../../common/types/common";

export const locators = [
  {
    attrId: "",
    element_id: "0955274655778840492142094709",
    height: 60,
    locator: {
      fullXpath: "/html/body/header/div/nav/ul[1]",
      taskStatus: "SUCCESS",
      robulaXpath: "//*[@class='uui-navigation nav navbar-nav m-l8']",
      output: "//*[@class='uui-navigation nav navbar-nav m-l8']",
    },
    annotationType: AnnotationType.UI,
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
      output: "//*[@class='footer-menu']",
    },
    annotationType: AnnotationType.UI,
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
      output: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a",
      taskStatus: "REVOKED",
    },
    annotationType: AnnotationType.UI,
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

export const locatorsWithFindBy = [
  {
    attrId: "",
    element_id: "0955274655778840492142094709",
    height: 60,
    locator: {
      fullXpath: "/html/body/header/div/nav/ul[1]",
      taskStatus: "SUCCESS",
      robulaXpath: "//*[@class='uui-navigation nav navbar-nav m-l8']",
      output: "//*[@class='uui-navigation nav navbar-nav m-l8']",
    },
    annotationType: AnnotationType.FindBy,
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
      output: "//*[@class='footer-menu']",
    },
    annotationType: AnnotationType.UI,
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
      output: "/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a",
      taskStatus: "REVOKED",
    },
    annotationType: AnnotationType.UI,
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

export const pageObjectHTML = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;

public class HomePage extends WebPage {
    ${AnnotationType.UI}("//*[@class='uui-navigation nav navbar-nav m-l8']")
    public list listUl;

    ${AnnotationType.UI}("//*[@class='footer-menu']")
    public list listUl7;

    ${AnnotationType.UI}("/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a")
    public badge badge;
}
`;

export const pageObjectMUI = `package site.pages;

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
    ${AnnotationType.UI}("//*[@class='uui-navigation nav navbar-nav m-l8']")
    public list listUl;

    ${AnnotationType.UI}("//*[@class='footer-menu']")
    public list listUl7;

    ${AnnotationType.UI}("/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a")
    public badge badge;
}
`;

export const pageObjectVuetify = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;

import com.epam.jdi.light.vuetify.elements.common.*;
import com.epam.jdi.light.vuetify.elements.complex.*;
import com.epam.jdi.light.vuetify.elements.complex.bars.*;
import com.epam.jdi.light.vuetify.elements.complex.breadcrumbs.*;
import com.epam.jdi.light.vuetify.elements.complex.panels.*;
import com.epam.jdi.light.vuetify.elements.complex.radiobuttons.*;
import com.epam.jdi.light.vuetify.elements.complex.stepper.*;
import com.epam.jdi.light.vuetify.elements.complex.tables.*;
import com.epam.jdi.light.vuetify.elements.complex.timelines.*;
import com.epam.jdi.light.vuetify.elements.composite.*;

public class HomePage extends WebPage {
    ${AnnotationType.UI}("//*[@class='uui-navigation nav navbar-nav m-l8']")
    public list listUl;

    ${AnnotationType.UI}("//*[@class='footer-menu']")
    public list listUl7;

    ${AnnotationType.UI}("/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a")
    public badge badge;
}
`;

export const pageObjectHTMLWithFindBy = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;
import com.epam.jdi.light.elements.pageobjects.annotations.FindBy;

public class HomePage extends WebPage {
    ${AnnotationType.FindBy}(xpath = "//*[@class='uui-navigation nav navbar-nav m-l8']")
    public list listUl;

    ${AnnotationType.UI}("//*[@class='footer-menu']")
    public list listUl7;

    ${AnnotationType.UI}("/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a")
    public badge badge;
}
`;

export const pageObjectMUIWithFindBy = `package site.pages;

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
import com.epam.jdi.light.elements.pageobjects.annotations.FindBy;

public class HomePage extends WebPage {
    ${AnnotationType.FindBy}(xpath = "//*[@class='uui-navigation nav navbar-nav m-l8']")
    public list listUl;

    ${AnnotationType.UI}("//*[@class='footer-menu']")
    public list listUl7;

    ${AnnotationType.UI}("/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a")
    public badge badge;
}
`;

export const pageObjectVuetifyWithFindBy = `package site.pages;

import com.epam.jdi.light.elements.pageobjects.annotations.locators.*;
import com.epam.jdi.light.elements.composite.*;
import com.epam.jdi.light.ui.html.elements.common.*;
import com.epam.jdi.light.elements.complex.*;
import com.epam.jdi.light.elements.common.*;
import com.epam.jdi.light.elements.complex.dropdown.*;
import com.epam.jdi.light.elements.complex.table.*;
import com.epam.jdi.light.ui.html.elements.complex.*;

import com.epam.jdi.light.vuetify.elements.common.*;
import com.epam.jdi.light.vuetify.elements.complex.*;
import com.epam.jdi.light.vuetify.elements.complex.bars.*;
import com.epam.jdi.light.vuetify.elements.complex.breadcrumbs.*;
import com.epam.jdi.light.vuetify.elements.complex.panels.*;
import com.epam.jdi.light.vuetify.elements.complex.radiobuttons.*;
import com.epam.jdi.light.vuetify.elements.complex.stepper.*;
import com.epam.jdi.light.vuetify.elements.complex.tables.*;
import com.epam.jdi.light.vuetify.elements.complex.timelines.*;
import com.epam.jdi.light.vuetify.elements.composite.*;
import com.epam.jdi.light.elements.pageobjects.annotations.FindBy;

public class HomePage extends WebPage {
    ${AnnotationType.FindBy}(xpath = "//*[@class='uui-navigation nav navbar-nav m-l8']")
    public list listUl;

    ${AnnotationType.UI}("//*[@class='footer-menu']")
    public list listUl7;

    ${AnnotationType.UI}("/html/body/div/div[1]/div/div[1]/div/div[1]/ul/li[1]/a")
    public badge badge;
}
`;

export const pageObjectCyrillic = `package io.github.jditesting.pages;

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
