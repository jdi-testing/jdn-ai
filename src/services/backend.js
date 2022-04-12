export const BUILD = 'build';
export const PREDICT = 'predict';
export const MUI_PREDICT = 'mui-predict';
export const HTML5_PREDICT = 'html5-predict';
export const GENERATE_XPATH = 'generate_xpath';
export const SHEDULE_XPATH_GENERATION = 'schedule_xpath_generation';
export const GET_TASK_STATUS = 'get_task_status';
export const REVOKE_TASK = 'revoke_task';
export const REVOKE_TASKS= 'revoke_tasks';
export const GET_TASK_RESULT = 'get_task_result';
export const CPU_COUNT = 'cpu-count';
export const REPORT_PROBLEM = 'report_problem';

export const BASE_URL = 'http:localhost:5050';

const headers = {
  'Content-Type': 'application/json',
};

class Request {
  constructor() {
    this.baseURL = BASE_URL;
  }

  concatGetUrl(url, payload) {
    return `${url}?${(new URLSearchParams(payload)).toString()}`;
  }

  async responseHandler(response) {
    if (response.ok) {
      const r = await response.json();
      return r;
    } else {
      throw new Error(response);
    }
  }

  async get(url, payload) {
    try {
      const r = await fetch(`${this.baseURL}/${this.concatGetUrl(url, payload)}`, {
        method: "GET",
        headers,
      });
      return await this.responseHandler(r);
    } catch (error) {
      throw new Error(error);
    }
  }

  async post(url, payload) {
    try {
      const r = await fetch(`${this.baseURL}/${url}`, {
        method: "POST",
        body: payload,
        headers,
      });
      return await this.responseHandler(r);
    } catch (error) {
      throw new Error(error);
    }
  }
}

export const request = new Request();
