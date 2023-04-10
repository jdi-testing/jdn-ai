import { BaseUrl } from "../types/mainSlice.types";

export const LocalUrl = "http://localhost:5050";
export const RemoteUrl = `http://10.253.219.156:${__DEV_ENVIRONMENT__ ? "5000" : "80"}` as BaseUrl;
