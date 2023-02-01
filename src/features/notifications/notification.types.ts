import { AnyAction, AsyncThunkAction } from "@reduxjs/toolkit";
import { locatorJump, locatorUndo, pageobjectUndo } from "./utils/undoActions";

export type UndoAction = typeof pageobjectUndo | typeof locatorUndo | typeof locatorJump;

export type CancelAnyAction =
  | AsyncThunkAction<any, any, any>
  | AnyAction
  | Array<AsyncThunkAction<any, any, any> | AnyAction>
  | undefined;

export type Action = UndoAction | Array<UndoAction> | CancelAnyAction;
