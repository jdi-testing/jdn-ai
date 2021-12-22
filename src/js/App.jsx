import React from "react";
import ReactDOM from "react-dom";

import { Provider as ReduxProvider } from "react-redux";

import "antd/lib/style/themes/default.less";
import "antd/dist/antd.less";
import "../css/main.less";
import AutoFind from "./components/autoFind/AutoFind";
import { Backdrop } from "./components/Backdrop/Backdrop";

import { store } from "./redux/store";

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

if (div instanceof Element) {
  ReactDOM.render(<App />, div);
}
