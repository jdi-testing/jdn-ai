import { FrameworkType, LocatorType } from "../../../common/types/common";
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
      output: html5Result,
      po: {
        ...pageObject0,
        framework: FrameworkType.JdiLight,
        locator: LocatorType.xPath,
        library: ElementLibrary.HTML5,
      },
    },
    {
      output: muiResult,
      po: {
        ...pageObject0,
        framework: FrameworkType.JdiLight,
        locator: LocatorType.xPath,
        library: ElementLibrary.MUI,
      },
    },
    {
      output: vuetifyResult,
      po: {
        ...pageObject0,
        framework: FrameworkType.JdiLight,
        locator: LocatorType.xPath,
        library: ElementLibrary.Vuetify,
      },
    },
  ];

  testData.forEach((testDataItem) => {
    test(`pom for ${testDataItem.po.library}`, () => {
      expect(editPomContent(content, testDataItem.po)).toBe(testDataItem.output);
    });
  });
});
