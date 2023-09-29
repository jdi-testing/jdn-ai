import './icon128.png';
import { ReduxApp } from './app/App';
import connector from './pageServices/connector';
import React from 'react';
import ReactDOM from 'react-dom/client';

connector
  .initScripts()
  .then(() => {
    const rootElement = document.getElementById('chromeExtensionReactApp');
    if (rootElement instanceof HTMLElement) {
      const root = ReactDOM.createRoot(rootElement);
      root.render(<ReduxApp />);
    } else {
      console.error("Container with ID 'chromeExtensionReactApp' not found in the DOM.");
    }
  })
  .catch((error) => {
    console.error("Can't launch JDN plugin", error);
  });
