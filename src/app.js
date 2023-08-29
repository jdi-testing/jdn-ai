import "./icon128.png";
import "./app/App";
import connector from "./pageServices/connector";
import React from "react";
import ReactDOM from "react-dom/client";
import { ReduxApp } from "./app/App";

connector
  .initScripts()
  .then(() => {
    const root = ReactDOM.createRoot(document.getElementById('root'));
    if (div instanceof Element) {
      root.render(<ReduxApp />);
    }
  })
  .catch((error) => {
    console.error("Can't launch JDN plugin", error);
  });
