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

  const documentResult = await connector.attachContentScript(() => {
    const fetchCSS = () => {
      let allStyles = '';
      for (let i = 0; i < document.styleSheets.length; i++) {
        const sheet = document.styleSheets[i];
        try {
          const rules = sheet.rules || sheet.cssRules;
          for (let j = 0; j < rules.length; j++) {
            allStyles += rules[j].cssText + '\n';
          }
        } catch (e) {
          console.error("Can't  fetch styles: ", e);
        }
      }
      return allStyles;
    };

    let outerHTML = document.documentElement.outerHTML;

    const stylesString = fetchCSS();
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
