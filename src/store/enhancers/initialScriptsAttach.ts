import { StoreEnhancer } from "@reduxjs/toolkit";
import { connector } from "../../services/connector";

const initialScriptsAttach: StoreEnhancer =
  (next) => (reducer, initialState) => {
    connector.attachStaticScripts();

    const nextState = next(reducer, initialState);
    return nextState;
  }

export default initialScriptsAttach;