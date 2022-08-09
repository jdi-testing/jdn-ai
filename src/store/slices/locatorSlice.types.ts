export enum LocatorsGenerationStatus {
    noStatus = "",
    started = "Locators generation is running in background...",
    complete = "Locators generation is successfully completed",
    failed = "Network error, check network settings or run server locally.",
}

export enum IdentificationStatus {
    noStatus = "",
    loading = "Loading...",
    success = "Successful!",
    removed = "Removed",
    error = "An error occured",
}

export type LocatorProgressStatus = LocatorTaskStatus.PENDING | LocatorTaskStatus.STARTED;

export enum LocatorTaskStatus {
    FAILURE = "FAILURE",
    RECEIVED = "RECEIVED",
    REVOKED = "REVOKED",
    RETRY = "RETRY",
    SUCCESS = "SUCCESS",
    PENDING = "PENDING",
    STARTED = "STARTED",
}

export enum LocatorCalculationPriority {
    Increased = "INCREASED",
    Decreased = "DECREASED",
}

export interface LocatorsState {
    generationStatus: LocatorsGenerationStatus,
    status: IdentificationStatus,
    scrollToLocator: null | string,
}

export type ElementId = string;

export interface Locator extends PredictedEntity {
    children?: string[],
    deleted?: boolean,
    generate: boolean,
    jdnHash: string,
    locator: {
        customXpath?: string,
        fullXpath: string,
        robulaXpath?: string,
        taskStatus?: LocatorTaskStatus,
        errorMessage: string,
    },
    name: string,
    isCmHighlighted?: boolean,
    isCustomName?: boolean,
    isCustomLocator?: boolean,
    priority?: LocatorCalculationPriority,
    type: string,
}

export interface PredictedEntity {
    element_id: ElementId,
    x: number,
    y: number,
    width: number,
    height: number,
    predicted_label: string,
    predicted_probability: number,
    sort_key: number
}