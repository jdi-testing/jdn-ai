import axios, { AxiosInstance, AxiosRequestConfig } from "axios";
import { BaseUrl } from "../store/slices/mainSlice.types";

export enum HttpEndpoint {
  BUILD = "build",
  MUI_PREDICT = "mui-predict",
  HTML5_PREDICT = "html5-predict",
  NGMAT_PREDICT = "angular-predict", // TODO: check when implemented at BE
  REPORT_PROBLEM = "report_problem",
  DOWNLOAD_TEMPLATE = "download_template",
  SESSION_ID = "get_session_id",
  GUIDE = "guide",
  PING_SMTP = "ping_smtp",
}

export enum WebSocketMessage {
  SCHEDULE_MULTIPLE_XPATH_GENERATIONS = "schedule_multiple_xpath_generations",
  SHEDULE_XPATH_GENERATION = "schedule_xpath_generation",
  REVOKE_TASKS = "revoke_tasks",
  UP_PRIORITY = "prioritize_existing_task",
  DOWN_PRIORITY = "deprioritize_existing_task",
  PING = "ping",
  PONG = "pong",
}

const headers = {
  "Content-Type": "application/json",
};

class Request {
  request: AxiosInstance;
  baseUrl: BaseUrl;

  constructor() {
    this.request = axios.create({
      headers,
    });
  }

  setBaseUrl(url: BaseUrl) {
    this.baseUrl = url;
  }

  async get(url: HttpEndpoint, config?: AxiosRequestConfig, baseURL?: BaseUrl) {
    if (!this.baseUrl && !baseURL) throw new Error("base URL is required");
    return this.request.get(url, { ...config, baseURL: this.baseUrl || baseURL }).then((response) => {
      if (url === HttpEndpoint.BUILD) return response;
      return response.data;
    });
  }

  async post<D>(url: HttpEndpoint, payload: D, config?: AxiosRequestConfig, baseURL?: BaseUrl) {
    if (!this.baseUrl && !baseURL) throw new Error("base URL is required");
    return this.request
        .post(url, payload, { ...config, baseURL: this.baseUrl || baseURL })
        .then((response) => response.data);
  }

  async getBlob(url: HttpEndpoint, config?: AxiosRequestConfig) {
    return this.get(url, { ...config, responseType: "blob" }).then((data) => {
      const blob = new Blob([data]);
      return blob;
    });
  }
}

export const request = new Request();
