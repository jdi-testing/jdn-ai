import { WebSocketMessage } from "../../../services/backend";
import { JDNHash, Locator, LocatorTaskStatus } from "../types/locator.types";
import { webSocketController } from "../../../services/webSocketController";
import { getDocument } from "../../../common/utils/getDocument";
import { MainState, MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { PageObject } from "../../pageObjects/types/pageObjectSlice.types";

export const isProgressStatus = (taskStatus?: LocatorTaskStatus) =>
  LocatorTaskStatus.PENDING === taskStatus || taskStatus === LocatorTaskStatus.STARTED;
export const isGeneratedStatus = (taskStatus: LocatorTaskStatus) => taskStatus === LocatorTaskStatus.SUCCESS;

class LocatorGenerationController {
  onGenerationFailed = null;
  sessionId: string;
  pageObject: PageObject;
  xPathConfig: MainState["xpathConfig"];
  document: string;

  init(sessionId: string, xPathConfig: MainState["xpathConfig"]) {
    this.sessionId = sessionId;
    this.xPathConfig = xPathConfig;
  }

  async scheduleMultipleXpathGeneration(
    elements: Locator[],
    pageObject?: PageObject,
    maxGenerationTime?: MaxGenerationTime
  ) {
    if (pageObject) this.pageObject = pageObject;
    this.document = await getDocument();

    const hashes = elements.map((element) => element.jdnHash);

    const config = {
      ...this.xPathConfig,
      maximum_generation_time: maxGenerationTime || this.xPathConfig.maximum_generation_time,
      ...(maxGenerationTime ? { advanced_calculation: true } : null),
    };

    return webSocketController
      .sendSocket(
        JSON.stringify({
          action: WebSocketMessage.SCHEDULE_MULTIPLE_XPATH_GENERATIONS,
          payload: {
            document: this.document,
            id: hashes,
            config,
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
        webSocketController.startPing();
      });
  }

  upPriority(ids: JDNHash[]) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
        JSON.stringify({
          action: WebSocketMessage.UP_PRIORITY,
          payload: { element_id: id },
        })
      );
    });
  }

  downPriority(ids: JDNHash[]) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
        JSON.stringify({
          action: WebSocketMessage.DOWN_PRIORITY,
          payload: { element_id: id },
        })
      );
    });
  }

  revokeTasks(hashes: JDNHash[]) {
    webSocketController.sendSocket(
      JSON.stringify({
        action: WebSocketMessage.REVOKE_TASKS,
        payload: { id: hashes },
      })
    );
  }
}

export const locatorGenerationController = new LocatorGenerationController();
