import { IdentificationStatus } from "../types/locator.types";
import { AUTO_GENERATION_TRESHOLD } from "./constants";

export const isIdentificationLoading = (status: IdentificationStatus) => status === IdentificationStatus.loading;

export const isAutoStartGeneration = (items: any[]) => items.length <= AUTO_GENERATION_TRESHOLD;
