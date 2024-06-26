import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import { BaseUrl } from '../app/types/mainSlice.types';

export enum HttpEndpoint {
  BUILD = 'build',
  MUI_PREDICT = 'mui-predict',
  HTML5_PREDICT = 'html5-predict',
  NGMAT_PREDICT = 'angular-predict', // ToDo: check when implemented at BE
  REPORT_PROBLEM = 'report_problem',
  DOWNLOAD_TEMPLATE = 'download_template',
  DOWNLOAD_TEMPLATE_VIVIDUS = 'download_template?repo_zip_url=https://github.com/vividus-framework/vividus-starter/archive/refs/heads/main.zip',

  SESSION_ID = 'get_session_id',
}

export enum WebSocketMessage {
  SCHEDULE_MULTIPLE_XPATH_GENERATIONS = 'schedule_multiple_xpath_generations',
  SCHEDULE_MULTIPLE_CSS_SELECTOR_GENERATIONS = 'schedule_css_selectors_generation',
  REVOKE_TASKS = 'revoke_tasks',
  UP_PRIORITY = 'prioritize_existing_task',
  DOWN_PRIORITY = 'deprioritize_existing_task',
  PING = 'ping',
}

const headers = {
  'Content-Type': 'application/json',
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
    if (!this.baseUrl && !baseURL) throw new Error('base URL is required');
    return this.request.get(url, { ...config, baseURL: this.baseUrl || baseURL }).then((response) => {
      if (url === HttpEndpoint.BUILD) return response;
      return response.data;
    });
  }

  async post<D>(url: HttpEndpoint, payload: D, config?: AxiosRequestConfig, baseURL?: BaseUrl) {
    if (!this.baseUrl && !baseURL) throw new Error('base URL is required');
    return this.request
      .post(url, payload, { ...config, baseURL: this.baseUrl || baseURL })
      .then((response) => response.data);
  }

  async getBlob(url: HttpEndpoint, config?: AxiosRequestConfig) {
    return this.get(url, { ...config, responseType: 'blob' }).then((data) => {
      return new Blob([data]);
    });
  }
}

export const request = new Request();
