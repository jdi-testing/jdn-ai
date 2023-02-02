import { ActionReducerMapBuilder, createAsyncThunk } from "@reduxjs/toolkit";
import { AxiosResponse } from "axios";
import { toInteger } from "lodash";
import { BackendStatus, BaseUrl, LocalUrl, MainState, RemoteUrl } from "../types/mainSlice.types";
import { HttpEndpoint, request } from "../../services/backend";
import { compatibleMajorVer, compatibleMinorVer } from "../../common/constants/compatibleVersions";

export const defineServer = createAsyncThunk("main/defineServer", async () => {
  const checkVersion = (request: Promise<AxiosResponse<BaseUrl>>, isRemote: boolean) =>
    request.then((response) => {
      const [major, minor] = response.data.split(".").map(toInteger);
      if (compatibleMajorVer === major && compatibleMinorVer === minor) {
        return JSON.parse(JSON.stringify(response));
      } else if (isRemote) {
        throw new Error(BackendStatus.IncompatibleVersionRemote);
      } else if (major < compatibleMajorVer || minor < compatibleMinorVer) {
        throw new Error(BackendStatus.OutdatedServerLocal);
      } else throw new Error(BackendStatus.OutdatedPluginLocal);
    });

  return Promise.any<AxiosResponse<BaseUrl>>([
    checkVersion(request.get(HttpEndpoint.BUILD, undefined, RemoteUrl), true),
    checkVersion(request.get(HttpEndpoint.BUILD, undefined, LocalUrl), false),
  ]).then(
    (response) => {
      request.setBaseUrl(response.config.baseURL as BaseUrl);
      return response;
    },
    ({ errors }) => {
      const errorMessages = [errors[0].message, errors[1].message];
      if (errorMessages.includes(BackendStatus.OutdatedPluginLocal)) {
        throw new Error(BackendStatus.OutdatedPluginLocal);
      } else if (errorMessages.includes(BackendStatus.OutdatedServerLocal)) {
        throw new Error(BackendStatus.OutdatedServerLocal);
      } else if (errorMessages.includes(BackendStatus.IncompatibleVersionRemote)) {
        throw new Error(BackendStatus.IncompatibleVersionRemote);
      } else throw new Error(BackendStatus.AccessFailed);
    }
  );
});

export const defineServerReducer = (builder: ActionReducerMapBuilder<MainState>) => {
  return builder
    .addCase(defineServer.fulfilled, (state, { payload }) => {
      state.serverVersion = payload.data;
      state.backendAvailable = BackendStatus.Accessed;
      state.baseUrl = payload.config.baseURL as BaseUrl;
    })
    .addCase(defineServer.rejected, (state, { error }) => {
      state.backendAvailable = error.message as BackendStatus;
    });
};
