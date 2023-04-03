import { ElementLibrary } from "../../../features/locators/types/generationClasses.types";
import { editPomContent } from "../../../features/pageObjects/utils/templateFileContent";
import { html5Result, muiResult, vuetifyResult } from "../__mocks__/pomTemplates.mock";
import { pageObject0 } from "../__mocks__/selectLocatorsByPageObject.mock";

describe("editPomContent function", () => {
  const content = `        <!--JDI-->
        <dependency>
        </dependency>

        <!-- If you need Material UI library
        <dependency>
        </dependency>
        -->

        <!-- If you need Vuetify library
        <dependency>
        </dependency>
        -->

        <!--Allure-->`;

  const testData = [
    {
      library: ElementLibrary.HTML5,
      output: html5Result,
      po: { ...pageObject0, library: ElementLibrary.HTML5 },
    },
    {
      library: ElementLibrary.MUI,
      output: muiResult,
      po: { ...pageObject0, library: ElementLibrary.MUI },
    },
    {
      library: ElementLibrary.Vuetify,
      output: vuetifyResult,
      po: { ...pageObject0, library: ElementLibrary.Vuetify },
    },
  ];

  testData.forEach((_testData) => {
    test(`pom for ${_testData.library}`, () => {
      expect(editPomContent(content, _testData.po)).toBe(_testData.output);
    });
  });
});
