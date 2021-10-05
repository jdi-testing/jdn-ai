import { observable, action } from "mobx";
import { saveAs } from "file-saver";
import JSZip from "jszip";
import CyrillicToTranslit from "cyrillic-to-translit-js";
// TODO: Export function

function varName(name) {
  return name[0].toLowerCase() + name.slice(1);
}

function getClassName(name) {
  if (isCyrillic(name)) {
    name = CyrillicToTranslit().transform(name, " ");
  }
  const words = name.split(new RegExp(" "));
  return words.map((word) => word[0].toUpperCase() + word.slice(1)).join("");
}

function isCyrillic(term) {
  const cyrillicPattern = /[а-яА-ЯЁё]/;
  return cyrillicPattern.test(term);
}

function poName(name, poName) {
  let result = getClassName(name);
  if (
    result.length > 4 &&
    result.substr(-4).toLowerCase() !== poName.toLowerCase()
  ) {
    result += poName;
  }
  return result;
}

function getSiteName(name) {
  return poName(name, "Site");
}

function getPageName(name) {
  return poName(name, "Page");
}

function locatorType(locator) {
  return locator && locator.indexOf("/") !== 1 ? "Css" : "XPath";
}

const isEmptyLocator = (locator) =>
  locator && locator.includes("EMPTY_LOCATOR");

const isSection = (type, mainModel) => {
  const { ruleBlockModel } = mainModel;
  const composites = Object.keys(ruleBlockModel.rules.CompositeRules);

  return composites[type];
};

function complexCode(type, locator, name, mainModel) {
  const template = mainModel.settingsModel.template;
  let complexTemplate = template.pageElementComplex;
  complexTemplate = complexTemplate.replace(/({{type}})/g, type);
  complexTemplate = complexTemplate.replace(/({{locators}})/, locator);
  complexTemplate = complexTemplate.replace(/({{name}})/, varName(name));

  return complexTemplate + "\n";
}

export function simpleCode(locatorType, locator, elType, name, mainModel) {
  const template = mainModel.settingsModel.template;
  let templatePath = "";

  if (isEmptyLocator(locator)) {
    templatePath = `    public ${elType} ${varName(name)};`;
  } else {
    templatePath =
      locatorType === "Css"
        ? template.pageElementCss
        : template.pageElementXPath;
    templatePath = templatePath.replace(/({{locator}})/, locator);
    templatePath = templatePath.replace(/({{type}})/, elType);
    templatePath = templatePath.replace(/({{name}})/, varName(name));
  }

  return templatePath + "\n";
}

function pageElementCode(page, pageName, mainModel) {
  const template = mainModel.settingsModel.template;

  let pageElementCodeTemplate = template.siteElement;
  pageElementCodeTemplate = pageElementCodeTemplate.replace(
    /({{url}})/,
    page.url
  );
  pageElementCodeTemplate = pageElementCodeTemplate.replace(
    /({{title}})/,
    page.title
  );
  pageElementCodeTemplate = pageElementCodeTemplate.replace(
    /({{type}})/,
    getPageName(pageName)
  );
  pageElementCodeTemplate = pageElementCodeTemplate.replace(
    /({{name}})/,
    varName(pageName)
  );

  return pageElementCodeTemplate + "\n";
}

function complexLocators(el, fields, mainModel) {
  const template = mainModel.settingsModel.template;
  let templatePath = "";
  let locators = [];
  for (let field in fields) {
    if ({}.hasOwnProperty.call(fields, field)) {
      let locator = el[field];
      if (locator && typeof locator === "string") {
        templatePath =
          locatorType(locator) === "Css"
            ? template.locatorCss
            : template.locatorXPath;
        templatePath = templatePath.replace(/({{type}})/, field.toLowerCase());
        templatePath = templatePath.replace(/({{locator}})/, locator);
        locators.push(templatePath);
      }
    }
  }
  const lastLoc = locators[locators.length - 1];
  locators[locators.length - 1] = lastLoc.lastIndexOf(",")
    ? lastLoc.substring(0, lastLoc.length - 1)
    : lastLoc;
  return locators.join("\n\t\t") + "\n\t";
}

function getFields(obj, commonFields) {
  let clone = Object.assign({}, obj);

  for (let field in commonFields) {
    if ({}.hasOwnProperty.call(commonFields, field)) {
      delete clone[field];
    }
  }

  for (let field in clone) {
    if (clone[field] === "internal") {
      delete clone[field];
    }
  }

  return clone;
}

function isSimple(el, fields) {
  let count = 0;

  for (let field in fields) {
    if (el[field] !== "") {
      count++;
    }
  }
  return count === 1;
}

function genEntities(parentId, arrOfElements, mainModel) {
  const { ruleBlockModel, settingsModel } = mainModel;
  const complex = ruleBlockModel.rules.ComplexRules;
  const simple = ruleBlockModel.rules.SimpleRules;
  const template = settingsModel.template;
  let entityTemplate = template.dataElement;

  return arrOfElements
    .filter(
      (el) =>
        el.parentId === parentId &&
        (simple[el.Type] || complex[el.Type]) &&
        el.Type !== "Button"
    )
    .map((el) => entityTemplate.replace(/({{name}})/, varName(el.Name)))
    .join("\n");
}

function getElement(el, generateBlockModel) {
  const key = typeof el;
  return key === "number" || key === "string"
    ? generateBlockModel.sections.get(el)
    : el;
}

function genCodeOfElements(parentId, arrOfElements, mainModel, isAutoFind) {
  const { ruleBlockModel, generateBlockModel } = mainModel;
  const composites = ruleBlockModel.rules.CompositeRules;
  const complex = ruleBlockModel.rules.ComplexRules;
  const simple = ruleBlockModel.rules.SimpleRules;

  let result = "";
  for (let i = 0; i < arrOfElements.length; i++) {
    let el = getElement(arrOfElements[i], generateBlockModel);

    if (el.parentId === parentId && (el.Locator || el.Root)) {
      if (composites[el.Type] && !isAutoFind) {
        result += simpleCode(
          locatorType(el.Locator),
          el.Locator,
          getClassName(el.Name),
          el.Name,
          mainModel
        );
      } else if (complex[el.Type] && !isAutoFind) {
        let fields = getFields(ruleBlockModel.elementFields[el.Type]);
        result += isSimple(el, fields)
          ? simpleCode(
              locatorType(el.Root),
              el.Root,
              el.Type,
              el.Name,
              mainModel
            )
          : complexCode(
              el.Type,
              complexLocators(el, fields, mainModel),
              el.Name,
              mainModel
            );
      } else if (simple[el.Type] || isAutoFind) {
        result += simpleCode(
          locatorType(el.Locator),
          el.Locator,
          el.Type,
          el.Name,
          mainModel
        );
      }
    }
  }
  return result;
}

function getPageCode(mainModel) {
  return mainModel.generateBlockModel.pages
    .map((page) => pageElementCode(page, getPageName(page.name), mainModel))
    .join("");
}

function sectionTemplate(pack, name, code, mainModel) {
  const template = mainModel.settingsModel.template;
  let secTemplate = template.section;

  secTemplate = secTemplate.replace(/({{package}})/, template.package || pack);
  secTemplate = secTemplate.replace(/({{type}})/, getClassName(name));
  secTemplate = secTemplate.replace(/({{elements}})/, code);

  return secTemplate;
}

function formTemplate(pack, name, code, entityName, mainModel) {
  const template = mainModel.settingsModel.template;
  let fTemplate = template.form;

  fTemplate = fTemplate.replace(/({{package}})/g, template.package || pack);
  fTemplate = fTemplate.replace(/({{type}})/g, getClassName(name));
  fTemplate = fTemplate.replace(/({{data}})/g, entityName);
  fTemplate = fTemplate.replace(/({{elements}})/g, code);

  return fTemplate;
}

export function getEntityName(name) {
  return getClassName(name.slice(0, -4) + "s");
}

export function sectionCode(pack, el, mainModel) {
  let code = genCodeOfElements(el.elId, el.children, mainModel);

  switch (el.Type) {
    case "Section":
      return sectionTemplate(pack, el.Name, code, mainModel);
    case "Form":
      return formTemplate(
        pack,
        el.Name,
        code,
        getEntityName(el.Name),
        mainModel
      );
  }
}

export function entityCode(pack, section, mainModel) {
  const entityName = getEntityName(section.Name);
  const template = mainModel.settingsModel.template;

  let entityCodeTemplate = template.data;
  entityCodeTemplate = entityCodeTemplate.replace(
    /({{package}})/,
    template.package || pack
  );
  entityCodeTemplate = entityCodeTemplate.replace(/({{type}})/g, entityName);
  entityCodeTemplate = entityCodeTemplate.replace(
    /({{elements}})/,
    genEntities(section.elId, section.children, mainModel)
  );

  return entityCodeTemplate;
}

export function siteCode(pack, domain, name, mainModel) {
  const template = mainModel.settingsModel.template;

  let siteTemplate = mainModel.settingsModel.template.site;
  siteTemplate = siteTemplate.replace(
    /({{package}})/g,
    template.package || pack
  );
  siteTemplate = siteTemplate.replace(/({{domain}})/g, domain);
  siteTemplate = siteTemplate.replace(
    /({{siteName}})/g,
    template.siteName || name
  );
  siteTemplate = siteTemplate.replace(/({{pages}})/, getPageCode(mainModel));

  return siteTemplate;
}

export function pageCode(page, mainModel, isAutoFind) {
  const pageName = getPageName(page.name);
  const template = mainModel.settingsModel.template;

  let pageTemplate = template.page;
  pageTemplate = pageTemplate.replace(
    /({{package}})/g,
    template.package || page.package
  );
  pageTemplate = pageTemplate.replace(/{{type}}/g, pageName);
  pageTemplate = pageTemplate.replace(
    /{{elements}}/,
    genCodeOfElements(null, page.elements, mainModel, isAutoFind)
  );

  return pageTemplate;
}

export default class ConversionToCodeModel {
  @observable currentPageCode;
  @observable siteCodeReady = false;
  @observable generatedPages = [];

  @action
  clearOldConversion() {
    this.generatedPages = [];
  }

  @action
  genPageCode(page, mainModel, isAutoFind) {
    this.currentPageCode = pageCode(page, mainModel, isAutoFind);
    this.generatedPages.push(this.currentPageCode);
  }

  @action
  setCurrentPageCode(index) {
    this.currentPageCode = this.generatedPages[index];
  }

  downloadPageCode(page, extension) {
    let objToSave = {
      content: this.currentPageCode,
      name: getPageName(page.name) + extension,
    };
    if (objToSave.content && objToSave.name) {
      let blob = new Blob([objToSave.content], {
        type: "text/plain;charset=utf-8",
      });
      saveAs(blob, objToSave.name);
    }
  }

  zipAllCode(mainModel) {
    let zip = new JSZip();
    let pack = mainModel.generateBlockModel.siteInfo.pack;
    let pages = mainModel.generateBlockModel.pages;
    let sections = mainModel.generateBlockModel.sections;
    let siteTitle = mainModel.generateBlockModel.siteInfo.siteTitle;
    let extension = mainModel.settingsModel.extension;
    let origin = mainModel.generateBlockModel.siteInfo.origin;
    if (!siteTitle) {
      return;
    }
    let siteName = getSiteName(siteTitle);

    zip.file(siteName + extension, siteCode(pack, origin, siteName, mainModel));

    this.generatedPages.forEach((page, index) => {
      zip
        .folder("pages")
        .file(getPageName(pages[index].name) + extension, page);
    });

    sections.forEach((section) => {
      zip
        .folder("sections")
        .file(
          getClassName(section.Name) + extension,
          sectionCode(pack, section, mainModel)
        );
    });

    sections.forEach((section) => {
      if (section.Type === "Form") {
        zip
          .folder("entities")
          .file(
            getEntityName(section.Name) + extension,
            entityCode(pack, section, mainModel)
          );
      }
    });

    zip.generateAsync({ type: "blob" }).then(function (content) {
      saveAs(content, "pageobject.zip");
    });
  }
}
