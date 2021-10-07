export const getGenerationAttributes = () => {
  /*
        Software License Agreement (BSD License)

        Copyright (c) 2009, Mozilla Foundation
        All rights reserved.

        Redistribution and use of this software in source and binary forms, with or without modification,
        are permitted provided that the following conditions are met:

        * Redistributions of source code must retain the above
          copyright notice, this list of conditions and the
          following disclaimer.

        * Redistributions in binary form must reproduce the above
          copyright notice, this list of conditions and the
          following disclaimer in the documentation and/or other
          materials provided with the distribution.

        * Neither the name of Mozilla Foundation nor the names of its
          contributors may be used to endorse or promote products
          derived from this software without specific prior
          written permission of Mozilla Foundation.

        THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS OR
        IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND
        FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR
        CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
        DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE,
        DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER
        IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT
        OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
        -->
        */
  const getElementTreeXPath = (element) => {
    const paths = [];

    // Use nodeName (instead of localName) so namespace prefix is included (if any).
    for (
      ;
      element && element.nodeType == Node.ELEMENT_NODE;
      element = element.parentNode
    ) {
      let index = 0;
      let hasFollowingSiblings = false;
      for (
        let sibling = element.previousSibling;
        sibling;
        sibling = sibling.previousSibling
      ) {
        // Ignore document type declaration.
        if (sibling.nodeType == Node.DOCUMENT_TYPE_NODE) continue;

        if (sibling.nodeName == element.nodeName) ++index;
      }

      for (
        let sibling = element.nextSibling;
        sibling && !hasFollowingSiblings;
        sibling = sibling.nextSibling
      ) {
        if (sibling.nodeName == element.nodeName) {
          hasFollowingSiblings = true;
        }
      }

      const tagName =
              (element.prefix ? element.prefix + ":" : "") + element.localName;
      const pathIndex =
              index || hasFollowingSiblings ? "[" + (index + 1) + "]" : "";
      paths.splice(0, 0, tagName + pathIndex);
    }

    return paths.length ? "/" + paths.join("/") : null;
    /*
            <---
            */
  };

  /*
    Make an 'ID' attribute to the camel notation. Rules:
    - Replace the dash just before the letters (search-button -> searchButton)
    - Before the numbers, replace a dash into an underline (ma-0-6 -> ma_0_6)
    - Otherwise, leave it as it is (searchButton -> searchButton)
  */
  const camelCase = (string) => {
    if (string.indexOf("-") < 0 && string.indexOf("_") < 0) {
      return string;
    }
    const regex = /(_|-)([a-z])/g;
    const toCamelCase = (string) => string[1].toUpperCase();
    return string
        .toLowerCase()
        .replace(regex, toCamelCase)
        .replaceAll("-", "_");
  };

  const mapElements = (elements) => {
    const generationAttributes = (elements.map((predictedElement) => {
      const element = document.querySelector(
          `[jdn-hash='${predictedElement.element_id}']`
      );
      if (!element) {
        return;
      }
      predictedElement.attrId = element.id;
      predictedElement.predictedAttrId = element.id ?
        camelCase(element.id) :
        "";
      predictedElement.tagName = element.tagName.toLowerCase();
      predictedElement.locator = {
        fullXpath: getElementTreeXPath(element),
      };

      return {
        ...predictedElement,
      };
    })).filter((el) => !!el);
    return generationAttributes;
  };

  chrome.runtime.onMessage.addListener(({ message, param }, sender, sendResponse) => {
    if (message === "GENERATE_ATTRIBUTES") {
      sendResponse(mapElements(param));
    }

    if (message === "PING_SCRIPT" && (param.scriptName === "generateXpathes")) {
      sendResponse({ message: true });
    }
  });
};
