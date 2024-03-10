import connector from '../../pageServices/connector';
import { fetchCSS } from '../../pageServices/contentScripts/fetchCSS';

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
    const fetchAndInlineStyles = async () => {
      const styleSheets = document.querySelectorAll('link[rel="stylesheet"]');
      const stylePromises = Array.from(styleSheets).map(async (link) => {
        const linkElement = link as HTMLLinkElement;
        if (linkElement.href) {
          return fetchCSS(linkElement.href)
            .then((cssText) => `<style>${cssText}</style>`)
            .catch((error) => {
              console.error('Failed to load CSS:', error);
              return '';
            });
        }
        return Promise.resolve('');
      });
      return Promise.all(stylePromises);
    };

    let inlineStyles: string[] = [];
    fetchAndInlineStyles()
      .then((res) => {
        inlineStyles = res;
      })
      .catch((e) => {
        console.error('Something went wrong: ', e);
        return []; // Возвращает пустой массив в случае ошибки
      });
    let outerHTML = document.documentElement.outerHTML;

    const stylesString = inlineStyles.join('\n');
    outerHTML = outerHTML.replace(/<link rel="stylesheet"[^>]+>/g, '');
    outerHTML = outerHTML.replace('</head>', `${stylesString}</head>`);

    const scripts = [...document.scripts]
      .map((script: HTMLScriptElement) => {
        return script.src ? `<script src="${script.src}"></script>` : `<script>${script.innerHTML}</script>`;
      })
      .join('\n');

    console.log('stylesString: ', stylesString);

    outerHTML = outerHTML.replace('</body>', `${scripts}</body>`);

    return JSON.stringify({ outerHTML });
  });

  const result = await documentResult[0].result;
  const { outerHTML } = JSON.parse(result);
  console.log(outerHTML);
  return JSON.stringify(outerHTML);
};

// const result = await documentResult[0].result;
// const { outerHTML } = JSON.parse(result);
// console.log(outerHTML);
// return JSON.stringify(outerHTML);
