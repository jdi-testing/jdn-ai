import { WebSocketMessage } from '../../../services/backend';
import { ILocator, JDNHash, LocatorTaskStatus } from '../types/locator.types';
import { webSocketController } from '../../../services/webSocketController';
import { MainState, MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { PageObject } from '../../pageObjects/types/pageObjectSlice.types';

export const isGeneratedStatus = (taskStatus: LocatorTaskStatus) => taskStatus === LocatorTaskStatus.SUCCESS;

class LocatorGenerationController {
  sessionId: string;

  pageObject: PageObject;

  xPathConfig: MainState['xpathConfig'];

  pageDocument: string;

  init(sessionId: string, xPathConfig: MainState['xpathConfig']) {
    this.sessionId = sessionId;
    this.xPathConfig = xPathConfig;
  }

  scheduleMultipleXpathGeneration(
    elements: ILocator[],
    pageDocument: string,
    pageObject?: PageObject,
    maxGenerationTime?: MaxGenerationTime,
  ) {
    if (pageObject) this.pageObject = pageObject;
    this.pageDocument = pageDocument;

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
            document: this.pageDocument, // заменить на documentForRobula
            id: hashes,
            config,
          },
          logging_info: {
            session_id: this.sessionId,
            page_object_creation: this.pageObject.name,
            element_library: this.pageObject.library,
            website_url: this.pageObject.url,
          },
        }),
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
        }),
      );
    });
  }

  downPriority(ids: JDNHash[]) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
        JSON.stringify({
          action: WebSocketMessage.DOWN_PRIORITY,
          payload: { element_id: id },
        }),
      );
    });
  }

  revokeTasks(hashes: JDNHash[]) {
    webSocketController.sendSocket(
      JSON.stringify({
        action: WebSocketMessage.REVOKE_TASKS,
        payload: { id: hashes },
      }),
    );
  }
}

export const locatorGenerationController = new LocatorGenerationController();
