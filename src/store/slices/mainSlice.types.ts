export interface MainState {
    allowIdentifyElements: boolean;
    backendAvailable: BackendStatus;
    baseUrl?: BaseUrl;
    serverVersion?: string;
    notifications: Notification[];
    pageHistory: Page[];
    perception: number;
    scriptMessage: string | null;
    showBackdrop: boolean;
    xpathConfig: {
        maximum_generation_time: number;
        allow_indexes_at_the_beginning: boolean;
        allow_indexes_in_the_middle: boolean;
        allow_indexes_at_the_end: boolean;
    }
}

export interface Page { page:  PageType}

export interface Notification {
    isCanceled: boolean;
    isHandled: boolean;
    action: string;
    prevValue: any;
}

export enum BackendStatus {
    TryToAccess = "Trying to access server...",
    Accessed = "Accessed",
    AccessFailed = "AccessFailed",
    ImcompatibleVersionLocal = "Local server version is incompatible. Please, use % with your version of plugin.",
    ImcompatibleVersionRemote = "Remote server version is incompatible. Please, update plugin",
    ImcompatibleVersions = "Remote and local server versions are incompatible. Please, update plugin or local server, or try to connect the remote server.",
    
}

export enum PageType {
    PageObject = "pageObject",
    LocatorsList = "locatorsList",
}

export type BaseUrl = "http://localhost:5050" | "http://10.253.219.156";