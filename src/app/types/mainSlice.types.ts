import type { AnyAction } from '@reduxjs/toolkit';
import { PageObjectId } from '../../features/pageObjects/types/pageObjectSlice.types';

export interface MainState {
  backendAvailable: BackendStatus;
  isSessionUnique: boolean;
  baseUrl?: BaseUrl;
  serverVersion?: string;
  notifications: Notification[];
  pageHistory: Page[];
  scriptMessage: { message: string; param: Record<string, any> } | null;
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
  isCanceled?: boolean;
  isHandled?: boolean;
  action: AnyAction;
  prevValue?: unknown;
  message?: string;
}

export enum BackendStatus {
  TryToAccess = 'Trying to access server...',
  Accessed = 'Accessed',
  AccessFailed = 'Access failed',
  OutdatedServerLocal = 'Local server version need to be updated.',
  OutdatedPluginLocal = 'Plugin version need to be updated.',
  IncompatibleVersionRemote = 'Remote server version is incompatible. Please, update plugin',
  // IncompatibleVersions = `Remote and local server versions are incompatible.
  // Please, update plugin or local server, or try to connect the remote server.`,
  Retry = 'Retrying...',
}

export enum PageType {
  PageObject = 'pageObject',
  LocatorsList = 'locatorsList',
}

export type BaseUrl = 'http://localhost:5050' | 'http://10.253.219.156:5000' | 'http://10.253.219.156:80';
