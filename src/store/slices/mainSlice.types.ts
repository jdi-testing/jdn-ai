import { AnyAction } from "@reduxjs/toolkit";
import { PageObjectId } from "./pageObjectSlice.types";

export interface MainState {
  backendAvailable: BackendStatus;
  baseUrl?: BaseUrl;
  serverVersion?: string;
  notifications: Notification[];
  pageHistory: Page[];
  perception: number;
  scriptMessage: { message: string; param: Record<string, any> } | null;
  showBackdrop: boolean;
  xpathConfig: {
    maximum_generation_time: MaxGenerationTime;
    allow_indexes_at_the_beginning: boolean;
    allow_indexes_in_the_middle: boolean;
    allow_indexes_at_the_end: boolean;
  };
}

export type MaxGenerationTime = 1 | 3 | 5 | 10 | 60 | 3600;

export interface Page {
  page: PageType;
  pageObj?: PageObjectId;
  alreadyGenerated?: boolean;
}

export interface Notification {
  isCanceled: boolean;
  isHandled: boolean;
  action: AnyAction;
  prevValue: unknown;
}

export enum BackendStatus {
  TryToAccess = "Trying to access server...",
  Accessed = "Accessed",
  AccessFailed = "AccessFailed",
  OutdatedServerLocal = "Local server version need to be updated.",
  OutdatedPluginLocal = "Plugin version need to be updated.",
  IncompatibleVersionRemote = "Remote server version is incompatible. Please, update plugin",
  IncompatibleVersions = `Remote and local server versions are incompatible. 
  Please, update plugin or local server, or try to connect the remote server.`,
}

export enum PageType {
  PageObject = "pageObject",
  LocatorsList = "locatorsList",
}

export const LocalUrl = "http://localhost:5050";
export const RemoteUrl = `http://10.253.219.156:${__DEV_ENVIRONMENT__ ? "5000" : "80"}` as BaseUrl;

export type BaseUrl = "http://localhost:5050" | "http://10.253.219.156";
