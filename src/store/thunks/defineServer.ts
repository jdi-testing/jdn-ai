import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { compatibleVersions } from "../../compatibleVersions";
import { HttpEndpoint, LOCAL_URL, REMOTE_URL, request } from "../../services/backend";
import { BackendStatus, BaseUrl, MainState } from "../slices/mainSlice.types";


export const defineServer = createAsyncThunk("main/defineServer", async () => {
    const checkVersion = (request: Promise<AxiosResponse<BaseUrl>>, errorMessage: BackendStatus) =>
        request
            .then((response) => {
                if (compatibleVersions.includes(response.data[0])) return JSON.parse(JSON.stringify(response));
                else throw new Error(errorMessage);
            })

    return Promise.any<AxiosResponse<BaseUrl>>([
        checkVersion(request.get(HttpEndpoint.BUILD, undefined, REMOTE_URL), BackendStatus.ImcompatibleVersionRemote),
        checkVersion(request.get(HttpEndpoint.BUILD, undefined, LOCAL_URL), BackendStatus.ImcompatibleVersionLocal)
    ]).then((response) => {
        request.setBaseUrl(response.config.baseURL as BaseUrl);
        return response;
    }, ({ errors }) => {
        const errorMessages = [errors[0].message, errors[1].message];
        if (
            errorMessages.includes(BackendStatus.ImcompatibleVersionLocal) &&
            errorMessages.includes(BackendStatus.ImcompatibleVersionRemote)
        ) throw new Error(BackendStatus.ImcompatibleVersions);
        else if (
            errorMessages.includes(BackendStatus.ImcompatibleVersionLocal)
        ) throw new Error(BackendStatus.ImcompatibleVersionLocal);
        else if (
            errorMessages.includes(BackendStatus.ImcompatibleVersionRemote)
        ) throw new Error(BackendStatus.ImcompatibleVersionRemote);
        else throw new Error(BackendStatus.AccessFailed);
    });
});

export const defineServerReducer = (builder: ActionReducerMapBuilder<MainState>) => {
    return builder
        .addCase(defineServer.fulfilled, (state, { payload }) => {
            state.serverVersion = payload.data[0];
            state.backendAvailable = BackendStatus.Accessed;
            state.baseUrl = payload.config.baseURL as BaseUrl;
        })
        .addCase(defineServer.rejected, (state, { error }) => {
            state.backendAvailable = error.message as BackendStatus;
        });
}