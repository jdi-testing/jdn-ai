import { connector } from "../../../pageServices/connector";
import { WebSocketMessage } from "../../../services/backend";
import { locatorProgressStatus, locatorTaskStatus } from "../../../common/constants/constants";
import { webSocketController } from "../../../services/webSocketController";

export const isProgressStatus = (taskStatus) => locatorProgressStatus.hasOwnProperty(taskStatus);
export const isGeneratedStatus = (taskStatus) => taskStatus === locatorTaskStatus.SUCCESS;

export const runGenerationHandler = async (elements, settings, onStatusChange, onGenerationFailed, pageObject) => {
  return locatorGenerationController.scheduleTaskGroup(
    elements,
    settings,
    (element_id, locator, jdnHash) => onStatusChange({ element_id, locator, jdnHash }),
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

    this.setMessageHandler();
  }

  async getDocument() {
    const documentResult = await connector.attachContentScript(() =>
      JSON.stringify(document.documentElement.innerHTML)
    );
    this.document = await documentResult[0].result;
    return;
  }

  getSessionId() {
    return chrome.storage.sync.get("JDN_SESSION_ID").then((res) => {
      return res.JDN_SESSION_ID;
    });
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
          this.onStatusChange(
            this.scheduledTasks.get(payload.id),
            {
              robulaXpath: payload.result,
              taskStatus: locatorTaskStatus.SUCCESS,
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

    const sessionId = await this.getSessionId();

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
            session_id: sessionId,
            page_object_creation: pageObject.name,
            element_library: pageObject.library,
            website_url: pageObject.url,
          },
        })
      )
      .then(() => {
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
    this.onGenerationFailed([...this.scheduledTasks.values()]);
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
