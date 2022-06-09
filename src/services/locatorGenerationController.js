import { isNull } from "lodash";

import { connector } from "./connector";
import { REVOKE_TASKS, SHEDULE_XPATH_GENERATION } from "../services/backend";
import { locatorProgressStatus, locatorTaskStatus } from "../utils/constants";

export const isProgressStatus = (taskStatus) => locatorProgressStatus.hasOwnProperty(taskStatus);
export const isGeneratedStatus = (taskStatus) => taskStatus === locatorTaskStatus.SUCCESS;

export const runGenerationHandler = async (elements, settings, onStatusChange) => {
  locatorGenerationController.scheduleTaskGroup(
      elements,
      settings,
      (element_id, locator) => onStatusChange({ element_id, locator }),
  );
};

export const stopGenerationHandler = (ids) => {
  return locatorGenerationController.revokeTasks(ids);
};

class LocatorGenerationController {
  constructor() {
    this.readyState = null;
    this.scheduledTasks = new Map();
    this.document = null;
    this.onStatusChange = null;
    this.queueSettings = null;
  }

  getElementId(taskId) {
    const t = [...this.scheduledTasks].find(([elementId, scheduledTaskId]) => taskId === scheduledTaskId);
    return t && t[0];
  }

  async init() {
    return this.openWebSocket().then((socket) => {
      return this.setMessageListener();
    });
  }

  async getDocument() {
    const documentResult = await connector.attachContentScript(() =>
      JSON.stringify(document.documentElement.innerHTML)
    );
    this.document = await documentResult[0].result;
    return;
  }

  openWebSocket() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket("ws://localhost:5050/ws");
      this.readyState = this.socket.readyState;

      this.socket.addEventListener("open", () => {
        this.readyState = this.socket.readyState;
        resolve(this.socket);
      });

      this.socket.addEventListener("error", (event) => {
        this.readyState = event.target.readyState;
        reject(new Error(event));
      });

      this.socket.addEventListener("close", (event) => {
        this.readyState = event.target.readyState;
      });
    });
  }

  setMessageListener() {
    this.socket.addEventListener("message", (event) => {
      const { payload, action, result } = JSON.parse(event.data);
      switch (action || result) {
        case "tasks_scheduled":
          const jdnHash = Object.keys(payload)[0];
          const element_id = [...this.scheduledTasks].find(
              ([elementId, scheduledTaskId]) =>
                jdnHash === elementId.substr(0, elementId.indexOf("_")) && !scheduledTaskId
          );
          this.scheduledTasks.set(element_id[0], Object.values(payload)[0]);
          break;
        case "status_changed":
          this.onStatusChange(this.getElementId(payload.id), { taskStatus: payload.status });
          if (payload.status === locatorTaskStatus.REVOKED) {
            this.scheduledTasks.delete(this.getElementId(payload.id));
          }
          break;
        case "result_ready":
          this.onStatusChange(this.getElementId(payload.id), { robulaXpath: payload.result });
          this.scheduledTasks.delete(this.getElementId(payload.id));
          break;
        default:
          break;
      }
    });
  }

  scheduleTask(element) {
    const { element_id, jdnHash } = element;
    this.scheduledTasks.set(element_id);
    this.socket.send(
        JSON.stringify({
          action: SHEDULE_XPATH_GENERATION,
          payload: {
            document: this.document,
            id: jdnHash,
            config: this.queueSettings,
          },
        })
    );
  }

  async scheduleTaskGroup(elements, settings, onStatusChange) {
    if (settings) this.queueSettings = settings;
    if (onStatusChange) this.onStatusChange = onStatusChange;
    await this.getDocument();

    if (isNull(this.readyState)) {
      this.init().then(() => {
        elements.map((element) => this.scheduleTask(element));
      });
    } else elements.map((element) => this.scheduleTask(element));
  }

  revokeTasks(ids) {
    const taskIds = ids.map((id) => this.scheduledTasks.get(id));
    this.socket.send(
        JSON.stringify({
          action: REVOKE_TASKS,
          payload: { id: taskIds },
        })
    );
  }

  revokeAll() {
    if (this.scheduledTasks.size) this.revokeTasks([...this.scheduledTasks.keys()]);
  }
}

export const locatorGenerationController = new LocatorGenerationController();
