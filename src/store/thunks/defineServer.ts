import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { BUILD, LOCAL_URL, REMOTE_URL, request } from "../../services/backend";
import { BackendStatus, BaseUrl, MainState } from "../slices/mainSlice.types";


export const defineServer = createAsyncThunk("main/defineServer", async () => {
    return Promise.any<AxiosResponse<string>>([
        request.get(BUILD, null, true, REMOTE_URL),
        request.get(BUILD, null, true, LOCAL_URL)]).then((response) => {
            request.setBaseUrl(response.config.baseURL);
            return response;
        }, (reject) => {
            throw new Error(reject);
        });
});

export const defineServerReducer = (builder: ActionReducerMapBuilder<MainState>) => {
    return builder
        .addCase(defineServer.fulfilled, (state, { payload }) => {
            state.backendAvailable = BackendStatus.ACCESSED;
            state.baseUrl = payload.config.baseURL as BaseUrl;
        })
        .addCase(defineServer.rejected, (state) => {
            state.backendAvailable = BackendStatus.ACCESS_FAILED;
        });
}