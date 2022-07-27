import { isNull } from "lodash";

import { connector } from "./connector";
import {
  DOWN_PRIORITY,
  request,
  REVOKE_TASKS,
  SCHEDULE_MULTIPLE_XPATH_GENERATIONS,
  UP_PRIORITY,
} from "../services/backend";
import { locatorProgressStatus, locatorTaskStatus } from "../utils/constants";

export const isProgressStatus = (taskStatus) => locatorProgressStatus.hasOwnProperty(taskStatus);
export const isGeneratedStatus = (taskStatus) => taskStatus === locatorTaskStatus.SUCCESS;

export const runGenerationHandler = async (elements, settings, onStatusChange) => {
  locatorGenerationController.scheduleTaskGroup(elements, settings, (element_id, locator) =>
    onStatusChange({ element_id, locator })
  );
};

export const stopGenerationHandler = (hashes) => {
  return locatorGenerationController.revokeTasks(hashes);
};

class LocatorGenerationController {
  constructor() {
    this.readyState = null;
    this.scheduledTasks = new Map();
    this.document = null;
    this.onStatusChange = null;
    this.queueSettings = null;
  }

  async init() {
    return this.openWebSocket().then(() => {
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

  sendSocket(json) {
    if (isNull(this.readyState) || this.readyState === 2 || this.readyState === 3) {
      this.init().then(() => {
        this.socket.send(json);
      });
    } else this.socket.send(json);
  }

  openWebSocket() {
    return new Promise((resolve, reject) => {
      this.socket = new WebSocket(`${request.baseUrl.replace("http", "ws")}/ws`);
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
        case "status_changed":
          if (payload.status === locatorTaskStatus.REVOKED || payload.status === locatorTaskStatus.FAILURE) {
            this.onStatusChange(this.scheduledTasks.get(payload.id), { taskStatus: payload.status });
            this.scheduledTasks.delete(payload.id);
          }
          break;
        case "result_ready":
          this.onStatusChange(this.scheduledTasks.get(payload.id), {
            robulaXpath: payload.result,
            taskStatus: locatorTaskStatus.SUCCESS,
          });
          this.scheduledTasks.delete(payload.id);
          break;
        default:
          break;
      }
    });
  }

  async scheduleTaskGroup(elements, settings, onStatusChange) {
    if (settings) this.queueSettings = settings;
    if (onStatusChange) this.onStatusChange = onStatusChange;
    await this.getDocument();

    const hashes = [];
    elements.forEach((element) => {
      const { element_id, jdnHash } = element;
      hashes.push(jdnHash);
      this.scheduledTasks.set(jdnHash, element_id);
      if (element.locator.taskStatus !== locatorTaskStatus.PENDING) {
        this.onStatusChange(element_id, { taskStatus: locatorTaskStatus.PENDING });
      }
    });
    this.sendSocket(
        JSON.stringify({
          action: SCHEDULE_MULTIPLE_XPATH_GENERATIONS,
          payload: {
            document: this.document,
            id: hashes,
            config: this.queueSettings,
          },
        })
    );
  }

  upPriority(ids) {
    ids.forEach((id) => {
      this.sendSocket(
          JSON.stringify({
            action: UP_PRIORITY,
            payload: { element_id: id },
          })
      );
    });
  }

  downPriority(ids) {
    ids.forEach((id) => {
      this.sendSocket(
          JSON.stringify({
            action: DOWN_PRIORITY,
            payload: { element_id: id },
          })
      );
    });
  }

  revokeTasks(hashes) {
    this.sendSocket(
        JSON.stringify({
          action: REVOKE_TASKS,
          payload: { id: hashes },
        })
    );
  }

  revokeAll() {
    if (this.scheduledTasks.size) this.revokeTasks([...this.scheduledTasks.values()]);
  }
}

export const locatorGenerationController = new LocatorGenerationController();
