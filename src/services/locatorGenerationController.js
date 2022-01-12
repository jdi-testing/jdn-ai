import { isNull, slice, take } from "lodash";

import { connector } from "./connector";
import { CPU_COUNT, request, SHEDULE_XPATH_GENERATION } from "../services/backend";
import { locatorProgressStatus, locatorTaskStatus } from "../utils/constants";

export const isProgressStatus = (taskStatus) => locatorProgressStatus.hasOwnProperty(taskStatus);
export const isGeneratedStatus = (taskStatus) => taskStatus === locatorTaskStatus.SUCCESS;

export const runGenerationHandler = async (elements, settings, onStatusChange, getNextLocator) => {
  const element = elements[0];

  locatorGenerationController.scheduleTaskQueue(
      elements,
      element.locator.settings || settings,
      (element_id, locator) => onStatusChange({ element_id, locator: { ...element.locator, ...locator } }),
      getNextLocator,
  );
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
  if (limit_maximum_generation_time) return { ...newConfig, maximum_generation_time };
  else return newConfig;
};

export const stopGenerationHandler = (element_id) => {
  return locatorGenerationController.revokeTask(element_id);
};

class LocatorGenerationController {
  constructor() {
    this.readyState = null;
    this.scheduledTasks = new Map();
    this.document = null;
    this.cpuCapacity = null;
    this.onStatusChange = null;
    this.getNextLocator = null;
    this.queueSettings = null;
  }

  async init(onStatusChange) {
    this.onStatusChange = onStatusChange;
    await this.getDocument();
    this.openWebSocket();
    return;
  }

  async getDocument() {
    const documentResult = await connector.attachContentScript(() =>
      JSON.stringify(document.documentElement.innerHTML)
    );
    this.document = await documentResult[0].result;
    return;
  }

  async getCpu() {
    const res = await request.get(CPU_COUNT);
    this.cpuCapacity = res.cpu_count;
    return;
  }

  openWebSocket() {
    this.socket = new WebSocket("ws://localhost:5050/ws");
    this.readyState = this.socket.readyState;
    console.log(this.readyState);

    this.socket.addEventListener("open", (event) => {
      this.readyState = this.socket.readyState;
      console.log(this.readyState);
    });

    this.socket.addEventListener("message", (event) => {
      console.log(event);
      const { payload, action } = JSON.parse(event.data);
      switch (action) {
        case "tasks_scheduled":
          this.scheduledTasks.set(Object.values(payload)[0], Object.keys(payload)[0]);
          break;
        case "status_changed":
          this.onStatusChange(this.scheduledTasks.get(payload.id), { taskStatus: payload.status });
          break;
        case "result_ready":
          this.onStatusChange(this.scheduledTasks.get(payload.id), { robulaXpath: payload.result });
          const nextLocator = this.getNextLocator();
          if (nextLocator) this.scheduleTask(nextLocator.element_id, this.queueSettings, this.onStatusChange);
          break;
        default:
          break;
      }
    });

    this.socket.addEventListener("error", (event) => {
      this.readyState = event.target.readyState;
      console.log(event);
    });

    this.socket.addEventListener("close", (event) => {
      console.log(event);
    });
  }

  async scheduleTask(elementId, settings, onStatusChange) {
    console.log(this.readyState);

    // if (isNull(this.readyState)) {
    //   await this.init(onStatusChange);
    //   this.scheduleTask(elementId, settings, onStatusChange);
    // } else if (this.readyState === 0) {
    if (this.readyState === 0) {
      setTimeout(() => this.scheduleTask(elementId, settings, onStatusChange), 1000);
    } else if (this.readyState === 1) {
      this.socket.send(
          JSON.stringify({
            action: SHEDULE_XPATH_GENERATION,
            payload: {
              document: this.document,
              id: elementId,
              config: getSettingsRequestConfig(settings),
            },
          })
      );
      onStatusChange(elementId, { taskStatus: locatorTaskStatus.STARTED });
    }
    return;
  }

  async scheduleTaskQueue(elementIds, settings, onStatusChange, getNextLocator) {
    this.getNextLocator = getNextLocator;
    this.queueSettings = settings;
    if (isNull(this.cpuCapacity)) {
      await this.getCpu();
    }
    const toSchedule = take(elementIds, this.cpuCapacity);
    const toPending = slice(elementIds, this.cpuCapacity);

    if (isNull(this.readyState)) {
      await this.init(onStatusChange);
    }

    // toSchedule.forEach(async ({element_id}) => {
    //   await this.scheduleTask(element_id, settings, onStatusChange);
    //   return;
    // });
    toSchedule.forEach(({element_id}) => this.scheduleTask(element_id, settings, onStatusChange));
    toPending.forEach(({element_id}) => onStatusChange(element_id, { taskStatus: locatorTaskStatus.PENDING }));
  }

  revokeTask(elementId) {
    // return task.scheduler.revokeTask();
  }

  revokeAll() {
    // const taskIds = this.scheduledGenerations.map((task) => task.elementId);
    // taskIds.forEach((id) => this.revokeTask(id));
  }
}

export const locatorGenerationController = new LocatorGenerationController();
