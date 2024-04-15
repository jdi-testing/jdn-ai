import connector from '../../pageServices/connector';

async function waitForAllStylesToLoad() {
  const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');

  const loadPromises = Array.from(styleSheets).map(
    (sheet) =>
      new Promise<void>((resolve) => {
        const linkElement = sheet as HTMLLinkElement;
        if (linkElement.sheet) {
          resolve();
        } else {
          linkElement.onload = () => resolve();
          linkElement.onerror = () => resolve();
        }
      }),
  );

  await Promise.all(loadPromises);
}

export const getFullDocumentWithStyles = async () => {
  await waitForAllStylesToLoad();

  const documentResult = await connector.attachContentScript(async () => {
    const fetchExternalStyles = (sheet: CSSStyleSheet) => {
      return new Promise<string>((resolve) => {
        chrome.runtime.sendMessage(
          {
            contentScriptQuery: 'fetchCSS',
            url: sheet.href,
          },
          (response) => {
            if (response && response.css && typeof response.css === 'string') {
              const formattedCss = response.css.trim() + '\n';
              resolve(formattedCss);
            } else {
              resolve('');
            }
          },
        );
      });
    };

    const getAllStyles = async () => {
      let allStyles = '';
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        if (sheet.href != null) {
          /* external styles: */
          try {
            const cssText = await fetchExternalStyles(sheet);
            allStyles += cssText;
          } catch (e) {
            console.error("Can't fetch styles: ", e);
          }
        } else {
          /* local styles: */
          try {
            const rules = sheet.rules || sheet.cssRules;
            for (let j = 0; j < rules.length; j++) {
              allStyles += rules[j].cssText + '\n';
            }
          } catch (e) {
            console.error("Can't fetch styles: ", e);
          }
        }
      }
      return allStyles.trim();
    };

    let outerHTML = document.documentElement.outerHTML;
    const stylesString = await getAllStyles();
    outerHTML = outerHTML.replace(/<link rel="stylesheet"[^>]+>/g, '');
    outerHTML = outerHTML.replace('</head>', `<style>\n${stylesString}</style></head>`);

    const scripts = [...document.scripts]
      .map((script: HTMLScriptElement) => {
        return script.src ? `<script src="${script.src}"></script>` : `<script>${script.innerHTML}</script>`;
      })
      .join('\n');

    outerHTML = outerHTML.replace('</body>', `${scripts}</body>`);

    return JSON.stringify({ outerHTML });
  });

  const result = await documentResult[0].result;
  const { outerHTML } = JSON.parse(result);
  return JSON.stringify(outerHTML);
};
