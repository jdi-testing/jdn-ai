// http enpoints
export const BUILD = 'build';
export const MUI_PREDICT = 'mui-predict';
export const HTML5_PREDICT = 'html5-predict';
export const REPORT_PROBLEM = 'report_problem';

// endpoints also used as ws actions
export const SCHEDULE_MULTIPLE_XPATH_GENERATIONS = "schedule_multiple_xpath_generations";
export const SHEDULE_XPATH_GENERATION = 'schedule_xpath_generation';
export const REVOKE_TASKS = 'revoke_tasks';

export const UP_PRIORITY = "prioritize_existing_task";
export const DOWN_PRIORITY = "deprioritize_existing_task";

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
