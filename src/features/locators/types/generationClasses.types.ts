import { HttpEndpoint } from "../../../services/backend";
import { HTML5classes } from "./html5Classes.types";
import { MUIclasses } from "./muiClasses.types";
import { NgMatClasses } from "./ngMatClasses.types";
import { VuetifyClasses } from "./vuetifyClasses.types";

export const defaultClass = "UIElement";

export type ElementLabel =
  | typeof MUIclasses
  | typeof HTML5classes
  | typeof NgMatClasses
  | typeof VuetifyClasses
  | typeof defaultClass;

export type ElementClass = MUIclasses | HTML5classes | NgMatClasses | VuetifyClasses | typeof defaultClass;

export enum ElementLibrary {
  MUI = "MUI",
  HTML5 = "HTML5",
  NgMat = "NgMat",
  Vuetify = "Vuetify",
}

export const defaultLibrary = ElementLibrary.MUI;

export const libraryNames: Record<ElementLibrary, string> = {
  [ElementLibrary.MUI]: "Material UI (beta)",
  [ElementLibrary.HTML5]: "HTML5",
  [ElementLibrary.NgMat]: "Angular Material",
  [ElementLibrary.Vuetify]: "Vuetify (beta)",
};

export const libraryClasses: Record<ElementLibrary, ElementLabel> = {
  [ElementLibrary.MUI]: MUIclasses,
  [ElementLibrary.HTML5]: HTML5classes,
  [ElementLibrary.NgMat]: NgMatClasses,
  [ElementLibrary.Vuetify]: VuetifyClasses,
};

export const predictEndpoints: Record<ElementLibrary, HttpEndpoint> = {
  [ElementLibrary.MUI]: HttpEndpoint.MUI_PREDICT,
  [ElementLibrary.HTML5]: HttpEndpoint.HTML5_PREDICT,
  [ElementLibrary.NgMat]: HttpEndpoint.NGMAT_PREDICT,
  [ElementLibrary.Vuetify]: HttpEndpoint.NGMAT_PREDICT,
};
