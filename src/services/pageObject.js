import { entries, lowerFirst, replace, size, toLower } from "lodash";
import { saveAs } from "file-saver";
import JSZip from "jszip";

import { connector } from "./connector";
import { getJDILabel } from "../utils/generationClassesMap";
import { pageObjectTemplate } from "./pageObjectTemplate";
import javaReservedWords from "../utils/javaReservedWords.json";
import { selectConfirmedLocators, selectPageObjects } from "../store/selectors/pageObjectSelectors";
import { testFileTemplate } from "./testFileTEmplate";

export const isStringMatchesReservedWord = (string) => javaReservedWords.includes(string);

export const getLocator = ({ fullXpath, robulaXpath, customXpath }) => {
  return customXpath || robulaXpath || fullXpath || "";
};

export const isNameUnique = (elements, element_id, newName) =>
  !elements.find((elem) => elem.name === newName && elem.element_id !== element_id);

export const isPONameUnique = (elements, id, newName) =>
  !elements.find((elem) => toLower(elem.name) === toLower(newName) && elem.id !== id);

export const createLocatorNames = (elements, library) => {
  const f = elements.filter((el) => el && !el.deleted);
  const uniqueNames = [];

  const getElementName = (element) => {
    const jdiLabel = getJDILabel(element.predicted_label, library).toLowerCase();
    return element.tagName === "a" || jdiLabel === element.tagName.toLowerCase() ?
      jdiLabel :
      jdiLabel + element.tagName[0].toUpperCase() + element.tagName.slice(1);
  };

  return f.map((e, i) => {
    let elementName = getElementName(e);
    let elementTagId = replace(e.predictedAttrId, new RegExp(" ", "g"), "");

    const startsWithNumber = new RegExp("^[0-9].+$");
    elementTagId = elementTagId.match(startsWithNumber) ? `name${elementTagId}` : elementTagId;

    if (uniqueNames.indexOf(elementName) >= 0) elementName += i;
    if (elementTagId && uniqueNames.indexOf(elementTagId) >= 0) elementTagId += i;
    uniqueNames.push(elementTagId, elementName);

    const name = e.isCustomName ? e.name : elementTagId || elementName;

    const type = getJDILabel(e.predicted_label, library);

    return {
      ...e,
      name,
      type,
    };
  });
};

export const getPageAttributes = async () => {
  return await connector.attachContentScript(() => {
    const { title, URL, location, domain } = document;
    return { title, url: URL, pathname: location.pathname, domain };
  });
};

export const getPage = async (locators, title, libraries) => {
  const pageObject = pageObjectTemplate(locators, title, libraries);
  return pageObject;
};

export const generatePageObject = async (elements, title, library) => {
  const page = await getPage(elements, title, [library]);
  const blob = new Blob([page.pageCode], {
    type: "text/plain;charset=utf-8",
  });
  saveAs(blob, `${page.title}.java`);
};

export const generateAndDownloadZip = async (state, template) => {
  const pageObjects = selectPageObjects(state);

  const zip = await JSZip.loadAsync(template, { createFolders: true });
  const rootFolder = entries(zip.files)[0][0];

  const newZip = new JSZip();

  // remove root folder by changing files path
  const filePromises = [];
  zip.folder(rootFolder).forEach(async (relativePath, file) => {
    if (file.dir) return;

    filePromises.push(
        file.async("string").then((content) => {
          newZip.file(relativePath, content, { binary: true });
        })
    );
  });

  Promise.all(filePromises).then(async () => {
    const saveZip = async () => {
      const blob = await newZip.generateAsync({ type: "blob" });
      saveAs(blob, `${rootFolder.replace("/", "")}.zip`);
    };

    for (const po of pageObjects) {
      // create page object files
      const locators = selectConfirmedLocators(state, po.id);
      if (!size(locators)) continue;
      const page = await getPage(locators, po.name, [po.library]);
      newZip.file(`src/main/java/site/pages/${page.title}.java`, page.pageCode, { binary: true });

      const instanceName = lowerFirst(po.name);

      newZip
          .file("src/test/resources/test.properties")
          .async("string")
          .then(
              function success(content) {
                const newContent = content.replace("${domain}", `\${'${po.domain}'}`);
                return newZip.file(`src/test/resources/test.properties`, newContent, { binary: true });
              }
          ).then(() => {
            return newZip
                .file("src/main/java/site/MySite.java")
                .async("string");
          }).then((content) => {
            const newContent = content.replace(
                "// ADD SITE PAGES WITH URLS",
                `// ADD SITE PAGES WITH URLS\n    @Url('${po.pathname}')\n    public static ${po.name} ${instanceName};`
            );
            return newZip.file(`src/main/java/site/MySite.java`, newContent, { binary: true });
          }).then(() => {
            return newZip.file(`src/test/java/tests/${po.name}Tests.java`, testFileTemplate(instanceName, po.name));
          })
          .then(() => {
            saveZip();
          });
    }
  });
};
