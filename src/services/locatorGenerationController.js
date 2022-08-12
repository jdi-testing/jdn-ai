import { connector } from "./connector";
import {
  DOWN_PRIORITY,
  PING,
  REVOKE_TASKS,
  SCHEDULE_MULTIPLE_XPATH_GENERATIONS,
  UP_PRIORITY,
} from "../services/backend";
import { locatorProgressStatus, locatorTaskStatus } from "../utils/constants";
import { webSocketController } from "./webSocketController";

export const isProgressStatus = (taskStatus) => locatorProgressStatus.hasOwnProperty(taskStatus);
export const isGeneratedStatus = (taskStatus) => taskStatus === locatorTaskStatus.SUCCESS;

export const runGenerationHandler = async (elements, settings, onStatusChange, onGenerationFailed) => {
  locatorGenerationController.scheduleTaskGroup(
      elements,
      settings,
      (element_id, locator, jdnHash) => onStatusChange({ element_id, locator, jdnHash }),
      onGenerationFailed,
  );
};

export const stopGenerationHandler = (hashes) => {
  return locatorGenerationController.revokeTasks(hashes);
};

class LocatorGenerationController {
  constructor() {
    this.scheduledTasks = new Map();
    this.document = null;
    this.onStatusChange = null;
    this.onGenerationFailed = null;
    this.pingInterval = null;
    this.pingTimeout = null;

    this.setMessageHandler();
  }

  async getDocument() {
    const documentResult = await connector.attachContentScript(() =>
      JSON.stringify(document.documentElement.innerHTML)
    );
    this.document = await documentResult[0].result;
    return;
  }

  setMessageHandler() {
    webSocketController.addSubscriber((event) => {
      const { payload, action, result, pong } = JSON.parse(event.data);
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
          },
          payload.id);
          this.scheduledTasks.delete(payload.id);
          if (this.scheduledTasks.size === 0) {
            clearInterval(this.pingInterval);
            clearTimeout(this.pingTimeout);
            this.pingTimeout = null;
          }
          break;
      }
      if (pong) {
        clearTimeout(this.pingTimeout);
        this.pingTimeout = null;
      }
    });
  }

  async scheduleTaskGroup(elements, settings, onStatusChange, onGenerationFailed) {
    if (settings) this.queueSettings = settings;
    if (onStatusChange) this.onStatusChange = onStatusChange;
    if (onGenerationFailed) this.onGenerationFailed = onGenerationFailed;
    await this.getDocument();

    const hashes = [];
    elements.forEach((element) => {
      const { element_id, jdnHash } = element;
      hashes.push(jdnHash);
      this.scheduledTasks.set(jdnHash, element_id);
      if (element.locator.taskStatus !== locatorTaskStatus.PENDING) {
        setTimeout(() => {
          this.onStatusChange(element_id, { taskStatus: locatorTaskStatus.PENDING });
        }, 0);
      }
    });

    webSocketController.sendSocket(
        JSON.stringify({
          action: SCHEDULE_MULTIPLE_XPATH_GENERATIONS,
          payload: {
            document: this.document,
            id: hashes,
            config: this.queueSettings,
          },
        })
    ).catch(() => {
      this.noResponseHandler();
    });

    this.pingInterval = setInterval(() => {
      if (!this.pingTimeout) {
        this.pingSocket();
      }
    }, 2000);
  }

  pingSocket() {
    webSocketController.sendSocket(
        JSON.stringify({
          action: PING,
          payload: Date.now(),
        })
    );
    this.pingTimeout = setTimeout(() => this.noResponseHandler(), 5000);
  }

  noResponseHandler() {
    this.onGenerationFailed([...this.scheduledTasks.values()]);
    this.scheduledTasks.clear();
  }

  upPriority(ids) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
          JSON.stringify({
            action: UP_PRIORITY,
            payload: { element_id: id },
          })
      );
    });
  }

  downPriority(ids) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
          JSON.stringify({
            action: DOWN_PRIORITY,
            payload: { element_id: id },
          })
      );
    });
  }

  revokeTasks(hashes) {
    webSocketController.sendSocket(
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
