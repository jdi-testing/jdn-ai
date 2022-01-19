import { isNull, take } from "lodash";

import { connector } from "./connector";
import { CPU_COUNT, request, REVOKE_TASKS, SHEDULE_XPATH_GENERATION } from "../services/backend";
import { locatorProgressStatus, locatorTaskStatus } from "../utils/constants";

export const isProgressStatus = (taskStatus) => locatorProgressStatus.hasOwnProperty(taskStatus);
export const isGeneratedStatus = (taskStatus) => taskStatus === locatorTaskStatus.SUCCESS;

export const runGenerationHandler = async (elements, settings, onStatusChange, getPendingLocators) => {
  locatorGenerationController.scheduleTaskQueue(
      elements,
      settings,
      (element_id, locator) => onStatusChange({ element_id, locator }),
      getPendingLocators,
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

export const stopGenerationHandler = (ids) => {
  return locatorGenerationController.revokeTasks(ids);
};

class LocatorGenerationController {
  constructor() {
    this.readyState = null;
    this.scheduledTasks = new Map();
    this.document = null;
    this.cpuCapacity = null;
    this.onStatusChange = null;
    this.getPendingLocators = null;
    this.queueSettings = null;
  }

  getIdByTask(taskId) {
    const t = [...this.scheduledTasks].find(([key, value]) => taskId === value);
    return t && t[0];
  }

  getAvailableCpu() {
    return this.cpuCapacity - this.scheduledTasks.size;
  }

  getNextPendingLocator() {
    const nextLocators = this.getPendingLocators();
    if (!nextLocators.length) return;
    let i = 0;
    let nextLocator = nextLocators[i];
    const checkAlreadyScheduled = (nextLocator) => nextLocator && this.scheduledTasks.has(nextLocator.element_id);
    while (checkAlreadyScheduled(nextLocator)) {
      nextLocator = nextLocators[i++];
    }
    return nextLocator;
  }

  async init() {
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

    this.socket.addEventListener("open", (event) => {
      this.readyState = this.socket.readyState;
    });

    this.socket.addEventListener("message", (event) => {
      const { payload, action, result } = JSON.parse(event.data);
      switch (action || result) {
        case "tasks_scheduled":
          this.scheduledTasks.set(Object.keys(payload)[0], Object.values(payload)[0]);
          break;
        case "status_changed":
          this.onStatusChange(this.getIdByTask(payload.id), { taskStatus: payload.status });
          break;
        case "result_ready":
          this.onStatusChange(this.getIdByTask(payload.id), { robulaXpath: payload.result });
          this.scheduledTasks.delete(this.getIdByTask(payload.id));
          const nextLocator = this.getNextPendingLocator();
          if (nextLocator) this.scheduleTask(nextLocator);
          break;
        case "tasks_revoked":
          payload.id.forEach((task) => {
            this.scheduledTasks.delete(this.getIdByTask(task));
          });
          if (this.getPendingLocators) this.scheduleTaskQueue();
        default:
          break;
      }
    });

    this.socket.addEventListener("error", (event) => {
      this.readyState = event.target.readyState;
      throw new Error(event);
    });

    this.socket.addEventListener("close", (event) => {
      this.readyState = event.target.readyState;
    });
  }

  closeWebSocket() {
    this.socket.close();
  }

  async scheduleTask(element) {
    const {element_id, locator} = element;
    if (this.readyState === 0) {
      setTimeout(() => this.scheduleTask(element), 1000);
    } else if (this.readyState === 1) {
      this.scheduledTasks.set(element_id);
      this.socket.send(
          JSON.stringify({
            action: SHEDULE_XPATH_GENERATION,
            payload: {
              document: this.document,
              id: element_id,
              config: getSettingsRequestConfig(locator.settings || this.queueSettings),
            },
          })
      );
    }
    return;
  }

  async scheduleTaskQueue(elements, settings, onStatusChange, getNextLocator) {
    if (getNextLocator) this.getPendingLocators = getNextLocator;
    if (settings) this.queueSettings = settings;
    if (onStatusChange) this.onStatusChange = onStatusChange;
    if (isNull(this.cpuCapacity)) {
      await this.getCpu();
    }
    if (isNull(this.readyState)) {
      await this.init(onStatusChange);
    }
    const availableCpu = this.getAvailableCpu();
    if (elements) {
      elements.forEach(({element_id}) => onStatusChange(element_id, { taskStatus: locatorTaskStatus.PENDING }));
      const toSchedule = take(elements, availableCpu);
      toSchedule.forEach((element) => this.scheduleTask(element));
    } else {
      const pending = take(this.getPendingLocators(), availableCpu);
      pending.forEach((element) => this.scheduleTask(element));
    }
  }

  revokeTasks(ids) {
    const taskIds = ids.map((id) => this.scheduledTasks.get(id));
    this.socket.send(
        JSON.stringify({
          action: REVOKE_TASKS,
          payload: {id: taskIds},
        })
    );
  }

  revokeAll() {
    this.getPendingLocators = null;
    if (this.scheduledTasks.size) this.revokeTasks([...this.scheduledTasks.keys()]);
  }
}

export const locatorGenerationController = new LocatorGenerationController();
