export const BUILD = 'build';
export const PREDICT = 'predict';
export const MUI_PREDICT = 'mui-predict';
export const GENERATE_XPATH = 'generate_xpath';
export const SHEDULE_XPATH_GENERATION = 'schedule_xpath_generation';
export const GET_TASK_STATUS = 'get_task_status';
export const REVOKE_TASK = 'revoke_task';
export const GET_TASK_RESULT = 'get_task_result';

export const BASE_URL = 'http:localhost:5000';

class Request {
  constructor() {
    this.baseURL = BASE_URL;
  }

  async errorHandler(response) {
    if (response.ok) {
      const r = await response.json();
      return r;
    } else {
      throw new Error(response);
    }
  }

  async get(url) {
    const r = await fetch(`${this.baseURL}/${url}`, {
      method: "GET",
    });
    return await this.errorHandler(r);
  }

  async post(url, payload) {
    const r = await fetch(`${this.baseURL}/${url}`, {
      method: "POST",
      body: payload,
    });
    return await this.errorHandler(r);
  }
}

export const request = new Request();
