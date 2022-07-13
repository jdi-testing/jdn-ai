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

export const BASE_URL = "http://10.253.219.156";

const headers = {
  "Content-Type": "application/json",
};

class Request {
  constructor() {
    this.request = axios.create({
      baseURL: BASE_URL,
      headers,
    });
  }

  async get(url, config) {
    return this.request
        .get(url, config)
        .then((response) => response.data)
        .catch((error) => {
          throw new Error(error);
        });
  }

  async getBlob(url, config) {
    return this.get(url, { ...config, responseType: "blob" }).then((data) => {
      const blob = new Blob([data]);
      return blob;
    });
  }

  async post(url, payload) {
    return this.request
        .post(url, payload)
        .then((response) => response.data)
        .catch((error) => {
          throw new Error(error);
        });
  }
}

export const request = new Request();
