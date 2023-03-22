import { saveAs } from "file-saver";
import { entries, isNumber, lowerFirst, size } from "lodash";
import JSZip from "jszip";
import { RootState } from "../../../app/store/store";
import { selectConfirmedLocators, selectPageObjects } from "../pageObject.selectors";
import { testFileTemplate } from "./testTemplate";
import { getPage } from "./pageObject";
import { PageObject } from "../types/pageObjectSlice.types";
import { ElementLibrary } from "../../locators/types/generationClasses.types";

const generatePoFile = (newZip: JSZip, page: { pageCode: string; title: string }) =>
  newZip.file(`src/main/java/site/pages/${page.title}.java`, page.pageCode, { binary: false });

const editTestPropertiesFile = (newZip: JSZip, po: PageObject) =>
  newZip
    .file("src/test/resources/test.properties")!
    .async("string")
    .then(function success(content) {
      const testDomain = po.origin;
      const newContent = content.replace("${domain}", `${testDomain}`);
      return newZip.file(`src/test/resources/test.properties`, newContent, { binary: true });
    });

const editMySiteFile = (newZip: JSZip, po: PageObject, instanceName: string) =>
  newZip
    .file("src/main/java/site/MySite.java")!
    .async("string")
    .then((content) => {
      if (content.includes(instanceName)) instanceName = `${instanceName}1`;
      const urlSearchParams = po.search;
      const testUrl = urlSearchParams.length ? po.pathname + urlSearchParams : po.pathname;
      const newContent = content.replace(
        "// ADD SITE PAGES WITH URLS",
        `// ADD SITE PAGES WITH URLS\n    @Url("${testUrl}")\n    public static ${po.name} ${instanceName};
          `
      );
      return newZip.file(`src/main/java/site/MySite.java`, newContent, { binary: true });
    });

const editTestsFile = (newZip: JSZip, po: PageObject, instanceName: string) =>
  newZip.file(`src/test/java/tests/${po.name}Tests.java`, testFileTemplate(instanceName, po.name));

export const editPomFile = (newZip: JSZip, po: PageObject) => {
  if (po.library === ElementLibrary.HTML5) return;

  return newZip
    .file("pom.xml")!
    .async("string")
    .then((content) => {
      let newContent = content;
      if (po.library === ElementLibrary.MUI && content.indexOf(`<!-- If you need Material UI library -->`) === -1) {
        newContent = newContent.replace(
          `<!-- If you need Material UI library`,
          `<!-- If you need Material UI library -->`
        );
        newContent = newContent.replace(`end for material ui -->`, `<!-- end for material ui -->`);
      } else if (po.library === ElementLibrary.Vuetify) {
        newContent = newContent.replace(`<!-- If you need Vuetify library`, `<!-- If you need Vuetify library -->`);
        newContent = newContent.replace(
          /<\/dependency>[\n\s\ta-zA-Z]*-->/,
          `</dependency>\n        <!-- end for Vuetify -->`
        );
      }

      return newZip.file("pom.xml", newContent, { binary: true });
    });
};

export const generateAndDownloadZip = async (state: RootState, template: Blob) => {
  const pageObjects = selectPageObjects(state);

  const zip = await JSZip.loadAsync(template, { createFolders: true });
  const rootFolder = entries(zip.files)[0][0];

  const newZip = new JSZip();

  // remove root folder by changing files path
  const filePromises: Array<Promise<JSZip.JSZipObject | void>> = [];
  (zip.folder(rootFolder) || []).forEach(async (relativePath, file) => {
    if (isNumber(file) || file.dir) return;

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
      const page = await getPage(locators, po.name, po.library);

      const instanceName = lowerFirst(po.name);

      await generatePoFile(newZip, page);
      await editTestPropertiesFile(newZip, po);
      await editMySiteFile(newZip, po, instanceName);
      await editTestsFile(newZip, po, instanceName);
      await editPomFile(newZip, po);
    }

    saveZip();
  });
};
