export const copyToClipboard = (value: string | string[]) => {
  const clipboard = navigator.clipboard;
  const valueString: string = valueToString(value);

  if (!clipboard) {
    console.error('Clipboard API is not supported in this browser.');
    return;
  }

  // eslint-disable-next-line prettier/prettier
  clipboard
    .writeText(valueString)
    .catch((error) => {
    console.warn('Error copying text to clipboard:', error);
    deprecatedCopyToClipboard(valueString);
  });
};

const valueToString = (value: string | string[]) => {
  if (Array.isArray(value)) {
    return value.join('\n');
  } else return value;
};

const deprecatedCopyToClipboard = (value: string) => {
  try {
    const textarea = document.createElement('textarea');
    textarea.value = value;

    document.body.appendChild(textarea);
    textarea.select();

    document.execCommand('copy'); // deprecated, but works

    document.body.removeChild(textarea);
  } catch (err) {
    console.warn('Second Error copying text to clipboard:', err);
  }
};
