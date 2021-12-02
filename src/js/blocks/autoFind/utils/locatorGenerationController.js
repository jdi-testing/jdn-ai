import { find, isEqual, pull } from "lodash";
import { GET_TASK_RESULT, GET_TASK_STATUS, request, REVOKE_TASK, SHEDULE_XPATH_GENERATION } from "./backend";
import { connector } from "./connector";

export const locatorProgressStatus = {
  PENDING: "PENDING",
  STARTED: "STARTED",
};

export const locatorTaskStatus = {
  FAILURE: "FAILURE",
  RECEIVED: "RECEIVED",
  REVOKED: "REVOKED",
  RETRY: "RETRY",
  SUCCESS: "SUCCESS",
  ...locatorProgressStatus,
};

export const isProgressStatus = (taskStatus) => locatorProgressStatus.hasOwnProperty(taskStatus);

export const runGenerationHandler = async (elements, settings, elementCallback) => {
  const documentResult = await connector.attachContentScript(() => JSON.stringify(document.documentElement.innerHTML));
  const document = await documentResult[0].result;

  elements.forEach((element) => {
    const callback = (element_id, locator) => {
      elementCallback({ ...element, locator: { ...element.locator, ...locator } });
    };
    locatorGenerationController.scheduleTask(
        element.element_id,
        element.locator.settings || settings,
        document,
        callback
    );
  });
};

const getSettingsRequestConfig = (settings) => {
  const {
    allow_indexes_at_the_beginning,
    allow_indexes_in_the_middle,
    allow_indexes_at_the_end,
    limit_maximum_generation_time,
    maximum_generation_time,
  } = settings;
  const newConfig = {
    allow_indexes_at_the_beginning,
    allow_indexes_in_the_middle,
    allow_indexes_at_the_end,
  };
  if (limit_maximum_generation_time) return {...newConfig, maximum_generation_time};
  else return newConfig;
};

export const stopGenerationHandler = (element_id) => {
  return locatorGenerationController.revokeTask(element_id);
};

export class LocatorGenerationScheduler {
  constructor(elementId, settings, document, callback) {
    this.elementId = elementId;
    this.settings = settings;
    this.statusCallback = callback;
    this.document = document;
    this.taskStatus = null;
    this.ping = null;
    this.requestInProgress = false;

    this.scheduleGeneration();
  }

  updateSettings(newSettings) {
    if (this.taskStatus !== locatorTaskStatus.STARTED) {
      this.settings = newSettings;
      return true;
    } else {
      return false;
    }
  }

  async scheduleGeneration() {
    const result = await request.post(
        SHEDULE_XPATH_GENERATION,
        JSON.stringify({
          document: this.document,
          id: this.elementId,
          config: getSettingsRequestConfig(this.settings),
        })
    );
    this.taskId = result.task_id;
    this.statusCallback(this.elementId, { taskStatus: locatorTaskStatus.PENDING });
    this.runStatusChecker();
  }

  async runStatusChecker() {
    this.ping = setInterval(this.checkTaskStatus.bind(this), 1000);
  }

  async getTaskResult() {
    const result = await request.post(
        GET_TASK_RESULT,
        JSON.stringify({
          id: this.taskId,
        })
    );
    this.statusCallback(this.elementId, { taskStatus: locatorTaskStatus.SUCCESS, robulaXpath: result.result });
  }

  async checkTaskStatus() {
    if (this.requestInProgress) return;

    this.requestInProgress = true;
    const result = await request.post(
        GET_TASK_STATUS,
        JSON.stringify({
          id: this.taskId,
        })
    );
    this.taskStatus = result.status;
    this.requestInProgress = false;

    if (!isProgressStatus(this.taskStatus)) {
      clearInterval(this.ping);
      locatorGenerationController.unscheduleTask(this.elementId);
    }
    if (this.taskStatus === locatorTaskStatus.SUCCESS) {
      this.getTaskResult();
    } else {
      this.statusCallback(this.elementId, { taskStatus: this.taskStatus });
    }
  }

  async revokeTask() {
    clearInterval(this.ping);
    locatorGenerationController.unscheduleTask(this.elementId);
    const res = await request.post(
        REVOKE_TASK,
        JSON.stringify({
          id: this.taskId,
        })
    );
    return {res, element_id: this.elementId};
  }
}

class LocatorGenerationController {
  constructor() {
    this.scheduledGenerations = [];
  }

  getTaskById(elementId) {
    return find(this.scheduledGenerations, { elementId: elementId });
  }

  scheduleTask(elementId, settings, document, callback) {
    const task = this.getTaskById(elementId);
    if (task) {
      if (isEqual(settings, task.scheduler.settings)) return;
      else {
        const success = task.scheduler.updateSettings(settings);
        if (success) return;
      }
    }

    this.scheduledGenerations.push({
      elementId,
      scheduler: new LocatorGenerationScheduler(elementId, settings, document, callback),
    });
  }

  unscheduleTask(elementId) {
    const task = this.getTaskById(elementId);
    pull(this.scheduledGenerations, task);
  }

  revokeTask(elementId) {
    const task = this.getTaskById(elementId);
    if (!task) return;
    this.unscheduleTask(elementId);
    return task.scheduler.revokeTask();
  }
}

export const locatorGenerationController = new LocatorGenerationController();
