import { Provider as ReduxProvider } from "react-redux";
import React from "react";
import ReactDOM from "react-dom";

import "antd/dist/antd.less";
import "antd/lib/style/themes/default.less";

import { Backdrop } from "./Backdrop/Backdrop";
import { store } from "../store/store";
import AutoFind from "./AutoFind";

import "./app.less";

class App extends React.Component {
  render() {
    return (
      <ReduxProvider {...{ store }}>
        <div>
          <Backdrop />
          <AutoFind />
        </div>
      </ReduxProvider>
    );
  }
}

const div = document.getElementById("chromeExtensionReactApp");
const currentSession = Date.now();

if (!localStorage.getItem('firstSession')) {
  localStorage.setItem('firstSession', currentSession);
}
if (localStorage.getItem('firstSession') && localStorage.getItem('firstSession') != currentSession) {
  localStorage.setItem('secondSession', currentSession);
}

window.onbeforeunload = () => {
  if (localStorage.getItem('secondSession')) {
    localStorage.removeItem('secondSession');
  } else {
    localStorage.removeItem('firstSession');
    localStorage.removeItem('secondSession');
  }
};

if (div instanceof Element) {
  ReactDOM.render(<App />, div);
}
