import { IdentificationStatus } from "../types/locator.types";

export const isIdentificationLoading = (status: IdentificationStatus) => status === IdentificationStatus.loading;
