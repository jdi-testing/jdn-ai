import connector from "../../../pageServices/connector";
import { WebSocketMessage } from "../../../services/backend";
import { LocatorTaskStatus } from "../types/locator.types";
import { webSocketController } from "../../../services/webSocketController";
import { NETWORK_ERROR, NO_ELEMENT_IN_DOCUMENT } from "./constants";

export const isProgressStatus = (taskStatus) =>
  LocatorTaskStatus.PENDING === taskStatus || taskStatus === LocatorTaskStatus.STARTED;
export const isGeneratedStatus = (taskStatus) => taskStatus === LocatorTaskStatus.SUCCESS;

export const runGenerationHandler = async (elements, settings, onStatusChange, onGenerationFailed, pageObject) => {
  return locatorGenerationController.scheduleTaskGroup(
    elements,
    settings,
    onStatusChange ? (element_id, locator, jdnHash) => onStatusChange({ element_id, locator, jdnHash }) : undefined,
    onGenerationFailed,
    pageObject
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
    this.sessionId = null;
    this.pageObject = null;

    this.setMessageHandler();
  }

  async getDocument() {
    const documentResult = await connector.attachContentScript(() =>
      JSON.stringify(document.documentElement.innerHTML)
    );
    this.document = await documentResult[0].result;
    return;
  }

  setSessionId(sessionId) {
    this.sessionId = sessionId;
  }

  setMessageHandler() {
    webSocketController.addSubscriber((event) => {
      const { payload, action, result, pong, error_message: errorMessage } = JSON.parse(event.data);
      switch (action || result) {
        case "status_changed":
          if (errorMessage === NO_ELEMENT_IN_DOCUMENT) {
            this.onGenerationFailed([this.scheduledTasks.get(payload.id)], errorMessage);
            this.scheduledTasks.delete(payload.id);
            break;
          }

          if (payload.status === LocatorTaskStatus.REVOKED || payload.status === LocatorTaskStatus.FAILURE) {
            this.onStatusChange(this.scheduledTasks.get(payload.id), { taskStatus: payload.status });
            this.scheduledTasks.delete(payload.id);
          }
          break;
        case "result_ready":
          this.onStatusChange(
            this.scheduledTasks.get(payload.id),
            {
              xPath: payload.result,
              taskStatus: LocatorTaskStatus.SUCCESS,
            },
            payload.id
          );
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

  async scheduleTaskGroup(elements, settings, onStatusChange, onGenerationFailed, pageObject) {
    if (settings) this.queueSettings = settings;
    if (onStatusChange) this.onStatusChange = onStatusChange;
    if (onGenerationFailed) this.onGenerationFailed = onGenerationFailed;
    if (pageObject) this.pageObject = pageObject;
    await this.getDocument();

    const hashes = [];
    elements.forEach((element) => {
      const { element_id, jdnHash } = element;
      hashes.push(jdnHash);
      this.scheduledTasks.set(jdnHash, element_id);
      if (element.locator.taskStatus !== LocatorTaskStatus.PENDING) {
        setTimeout(() => {
          this.onStatusChange(element_id, { taskStatus: LocatorTaskStatus.PENDING });
        }, 0);
      }
    });

    return webSocketController
      .sendSocket(
        JSON.stringify({
          action: WebSocketMessage.SCHEDULE_MULTIPLE_XPATH_GENERATIONS,
          payload: {
            document: this.document,
            id: hashes,
            config: this.queueSettings,
          },
          logging_info: {
            session_id: this.sessionId,
            page_object_creation: this.pageObject.name,
            element_library: this.pageObject.library,
            website_url: this.pageObject.url,
          },
        })
      )
      .then(() => {
        if (!this.pingInterval) return;
        this.pingInterval = setInterval(() => {
          if (!this.pingTimeout) {
            this.pingSocket();
          }
        }, 5000);
      })
      .catch(() => {
        this.noResponseHandler();
      });
  }

  pingSocket() {
    webSocketController.sendSocket(
      JSON.stringify({
        action: WebSocketMessage.PING,
        payload: Date.now(),
      })
    );
    this.pingTimeout = setTimeout(() => {
      this.noResponseHandler();
    }, 5000);
  }

  noResponseHandler() {
    this.onGenerationFailed([...this.scheduledTasks.values()], NETWORK_ERROR);
    this.scheduledTasks.clear();
  }

  upPriority(ids) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
        JSON.stringify({
          action: WebSocketMessage.UP_PRIORITY,
          payload: { element_id: id },
        })
      );
    });
  }

  downPriority(ids) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
        JSON.stringify({
          action: WebSocketMessage.DOWN_PRIORITY,
          payload: { element_id: id },
        })
      );
    });
  }

  revokeTasks(hashes) {
    webSocketController.sendSocket(
      JSON.stringify({
        action: WebSocketMessage.REVOKE_TASKS,
        payload: { id: hashes },
      })
    );
  }

  revokeAll() {
    if (this.scheduledTasks.size) this.revokeTasks([...this.scheduledTasks.values()]);
  }
}

export const locatorGenerationController = new LocatorGenerationController();
