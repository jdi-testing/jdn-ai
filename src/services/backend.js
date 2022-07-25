import axios from "axios";

// http enpoints
export const BUILD = "build";
export const MUI_PREDICT = "mui-predict";
export const HTML5_PREDICT = "html5-predict";
export const REPORT_PROBLEM = "report_problem";
export const DOWNLOAD_TEMPLATE = "download_template";

// endpoints also used as ws actions
export const SCHEDULE_MULTIPLE_XPATH_GENERATIONS = "schedule_multiple_xpath_generations";
export const SHEDULE_XPATH_GENERATION = "schedule_xpath_generation";
export const REVOKE_TASKS = "revoke_tasks";

export const UP_PRIORITY = "prioritize_existing_task";
export const DOWN_PRIORITY = "deprioritize_existing_task";

export const REMOTE_URL = "http://10.253.219.156";
export const LOCAL_URL = "http://localhost:5050";

const headers = {
  "Content-Type": "application/json",
};

class Request {
  constructor() {
    this.request = axios.create({
      headers,
    });

    this.baseUrl = REMOTE_URL;
  }

  async get(url, config, baseChanged) {
    return this.request
        .get(url, {...config, baseURL: this.baseUrl})
        .then((response) => response.data)
        .catch((error) => {
          return this.errorHandler(error, (_baseChanged) => this.get(url, config, _baseChanged), baseChanged);
        });
  }

  async post(url, payload, config, baseChanged) {
    return this.request
        .post(url, payload, {...config, baseURL: this.baseUrl})
        .then((response) => response.data)
        .catch((error) => {
          return this.errorHandler(error, (_baseChanged) => this.post(url, payload, config, _baseChanged), baseChanged);
        });
  }

  async getBlob(url, config) {
    return this.get(url, { ...config, responseType: "blob" }).then((data) => {
      const blob = new Blob([data]);
      return blob;
    });
  }

  errorHandler(error, callback, baseChanged) {
    if (baseChanged) throw error;

    switch (error.config.baseURL) {
      case REMOTE_URL:
        this.baseUrl = LOCAL_URL;
        return callback(true);
      case LOCAL_URL:
        this.baseUrl = REMOTE_URL;
        return callback(true);
    }
  }
}

export const request = new Request();
