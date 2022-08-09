export interface MainState {
    allowIdentifyElements: boolean;
    backendAvailable: BackendStatus;
    notifications: Notification[];
    pageHistory: string[];
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

export interface Notification {
    isCanceled: boolean;
    isHandled: boolean;
    action: string;
    prevValue: any;
}

export enum BackendStatus {
    TRY_TO_ACCESS = "TRY_TO_ACCESS",
    ACCESSED = "ACCESSED",
    ACCESS_FAILED = "ACCESS_FAILED",
}