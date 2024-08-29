import { saveAs } from 'file-saver';
import { entries, isNumber, lowerFirst, size } from 'lodash';
import JSZip from 'jszip';
import { RootState } from '../../../app/store/store';
import { selectCurrentPageObject, selectPageObjects } from '../selectors/pageObjects.selectors';
import { testFileTemplate } from './testTemplate';
import { getPage } from './pageObject';
import { PageObject } from '../types/pageObjectSlice.types';
import { ElementLibrary } from '../../locators/types/generationClasses.types';
import { editPomContent } from './templateFileContent';
import { selectConfirmedLocators } from '../../locators/selectors/locatorsFiltered.selectors';
import { FrameworkType } from '../../../common/types/common';
import { selectIsTableView } from '../../locators/selectors/vivdusView.selectors';

const VIVIDUS = {
  PAGES_PROPERTIES_PATH: 'src/main/resources/properties/suite/web_app/pages.properties',
  SITE_PROPERTIES_PATH: 'src/main/resources/properties/suite/web_app/site.properties',
};

const JDI = {
  MY_SITE_PATH: 'src/main/java/site/MySite.java',
  EXAMPLE_STRING: '// ADD SITE PAGES WITH URLS',
};

const isVividusFramework = (framework: FrameworkType) => framework === FrameworkType.Vividus;

const generatePoFile = (newZip: JSZip, framework: FrameworkType, page: { pageCode: string; title?: string }) => {
  const path = isVividusFramework(framework)
    ? VIVIDUS.PAGES_PROPERTIES_PATH
    : `src/main/java/site/pages/${page.title}.java`;

  newZip.file(path, page.pageCode, { binary: false });
};

const editTestPropertiesFile = (newZip: JSZip, po: PageObject) => {
  const testPropertiesFile = newZip.file('src/test/resources/test.properties');

  if (!testPropertiesFile) {
    console.error('File src/test/resources/test.properties not found in the zip');
    return Promise.resolve();
  }

  return testPropertiesFile.async('string').then(function success(content) {
    const testDomain = po.origin;
    const newContent = content.replace('${domain}', `${testDomain}`);
    return newZip.file(`src/test/resources/test.properties`, newContent, { binary: true });
  });
};

const addContent = (originalString: string, newContent: string) => {
  const regex = /\n\}/;

  return originalString.replace(regex, `\n\n    ${newContent}\n}`);
};

const editMySiteFile = async (
  newZip: JSZip,
  framework: FrameworkType,
  pathname: string,
  search: string,
  name: string,
) => {
  if (isVividusFramework(framework)) return;

  let instanceName = lowerFirst(name);
  const mySiteFile = newZip.file(JDI.MY_SITE_PATH);
  if (!mySiteFile) {
    console.error(`File ${JDI.MY_SITE_PATH} not found in the zip`);
    return;
  }

  const content = await mySiteFile.async('string');
  if (content.includes(instanceName)) instanceName = `${instanceName}1`;
  const urlSearchParams = search;
  const testUrl = urlSearchParams.length ? pathname + urlSearchParams : pathname;

  const newContent = addContent(content, `@Url("${testUrl}")\n    public static ${name} ${instanceName};`);

  newZip.file(JDI.MY_SITE_PATH, newContent, { binary: true });
};

const editTestsFile = (newZip: JSZip, name: string) => {
  const instanceName = lowerFirst(name);
  return newZip.file(`src/test/java/tests/${name}Tests.java`, testFileTemplate(instanceName, name));
};

export const editPomFile = async (newZip: JSZip, po: PageObject) => {
  if (po.library === ElementLibrary.HTML5) return;

  const pomFile = newZip.file('pom.xml');
  if (!pomFile) {
    console.error('File pom.xml not found in the zip');
    return;
  }

  const content = await pomFile.async('string');
  newZip.file('pom.xml', editPomContent(content, po), { binary: true });
};

export const generateAndDownloadZip = async (state: RootState, template: Blob) => {
  const pageObjects = selectPageObjects(state);
  const currentPageObject = selectCurrentPageObject(state);

  const zip = await JSZip.loadAsync(template, { createFolders: true });
  const rootFolder = entries(zip.files)[0][0];

  const newZip = new JSZip();

  // remove root folder by changing files path
  const filePromises: Array<Promise<JSZip.JSZipObject | void>> = [];
  (zip.folder(rootFolder) || []).forEach(async (relativePath, file) => {
    if (isNumber(file) || file.dir) return;

    filePromises.push(
      file.async('string').then((content) => {
        newZip.file(relativePath, content, { binary: true });
      }),
    );
  });

  Promise.all(filePromises).then(async () => {
    const saveZip = async () => {
      const blob = await newZip.generateAsync({ type: 'blob' });
      saveAs(blob, `${rootFolder.replace('/', '')}.zip`);
    };

    let vividusPageCode = '';

    for (const po of pageObjects) {
      // create page object files
      const { id, name, framework, url, pathname, search } = po;

      const locators = selectConfirmedLocators(state, id);
      const isLastPo = po === pageObjects[pageObjects.length - 1];
      const isEmptyPageObject = currentPageObject?.id !== id;

      if (!size(locators)) continue;

      if (isVividusFramework(framework)) {
        const isTableView = selectIsTableView(state);
        vividusPageCode += (await getPage(locators, po, isTableView))?.pageCode + '\n';

        if (!isLastPo && !isEmptyPageObject) continue;

        newZip.file(VIVIDUS.SITE_PROPERTIES_PATH, `variables.siteURL=${url}`, { binary: true });
        await generatePoFile(newZip, framework, { pageCode: vividusPageCode });
      } else {
        const page = await getPage(locators, po, false);

        await generatePoFile(newZip, framework, page);
        await editTestPropertiesFile(newZip, po);
        await editMySiteFile(newZip, framework, pathname, search, name);
        await editTestsFile(newZip, name);
        await editPomFile(newZip, po);
      }
    }

    saveZip();
  });
};
