import "./icon128.png";
import "./app/App";
import connector from "./pageServices/connector";
import React from "react";
import ReactDOM from "react-dom";
import { ReduxApp } from "./app/App";

connector
  .initScripts()
  .then(() => {
    const div = document.getElementById("chromeExtensionReactApp");
    if (div instanceof Element) {
      ReactDOM.render(<ReduxApp />, div);
    }
  })
  .catch((error) => {
    console.error("Can't launch JDN plugin", error);
  });
