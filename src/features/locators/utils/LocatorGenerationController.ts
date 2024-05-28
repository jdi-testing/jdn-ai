import { WebSocketMessage } from '../../../services/backend';
import { ILocator, JDNHash } from '../types/locator.types';
import { webSocketController } from '../../../services/webSocketController';
import { MainState, MaxGenerationTime } from '../../../app/types/mainSlice.types';
import { PageObject } from '../../pageObjects/types/pageObjectSlice.types';
import { GeneralLocatorType } from '../../../common/types/common';
import { getWebSocketMessages } from './helpers';

export interface IGeneralWebSocketMessage {
  action: WebSocketMessage;
  payload: {
    document: string;
    id: string[];
    config?: MainState['xpathConfig'];
  };
  logging_info?: {
    session_id: string;
    page_object_creation: string;
    element_library: string;
    website_url: string;
  };
}

class LocatorGenerationController {
  sessionId: string;

  pageObject: PageObject;

  xPathConfig: MainState['xpathConfig'];

  pageDocument: string;

  xPathGenerationMessage: IGeneralWebSocketMessage;

  CssSelectorGenerationMessage: IGeneralWebSocketMessage;

  init(sessionId: string, xPathConfig: MainState['xpathConfig']) {
    this.sessionId = sessionId;
    this.xPathConfig = xPathConfig;
  }

  scheduleMultipleLocatorGeneration(
    locatorType: GeneralLocatorType,
    elements: ILocator[],
    pageDocument: string,
    pageObject?: PageObject,
    maxGenerationTime?: MaxGenerationTime,
    isLocalServer?: boolean,
  ) {
    if (pageObject) this.pageObject = pageObject;
    this.pageDocument = pageDocument;

    const hashes = elements.map((element) => element.jdnHash);

    const config = {
      ...this.xPathConfig,
      maximum_generation_time: maxGenerationTime || this.xPathConfig.maximum_generation_time,
      ...(maxGenerationTime ? { advanced_calculation: true } : null),
    };

    this.xPathGenerationMessage = {
      action: WebSocketMessage.SCHEDULE_MULTIPLE_XPATH_GENERATIONS,
      payload: {
        document: this.pageDocument,
        id: hashes,
        config,
      },
      logging_info: {
        session_id: this.sessionId,
        page_object_creation: this.pageObject.name,
        element_library: this.pageObject.library,
        website_url: this.pageObject.url,
      },
    };

    this.CssSelectorGenerationMessage = {
      action: WebSocketMessage.SCHEDULE_MULTIPLE_CSS_SELECTOR_GENERATIONS,
      payload: {
        document: this.pageDocument,
        // TODO: remove condition ("isLocalServer ?", ": []") when back-end will be ready (issues/1284)
        id: isLocalServer ? hashes : [],
      },
    };

    const messages = getWebSocketMessages(locatorType, this.xPathGenerationMessage, this.CssSelectorGenerationMessage);

    // TODO: remove condition and variable "webSocketOperation" when back-end will be ready (issues/1284) 88, 98-105 lines
    const webSocketOperation = isLocalServer
      ? webSocketController
          .sendSocket(JSON.stringify(messages[0]))
          .then(() => webSocketController.sendSocket(JSON.stringify(messages[1])))
          .then(() => {
            webSocketController.startPing();
          })
          .catch((error: unknown) => {
            console.error('Error sending messages: ', error);
          })
      : webSocketController
          .sendSocket(JSON.stringify(this.xPathGenerationMessage))
          .then(() => {
            webSocketController.startPing();
          })
          .catch((error: unknown) => {
            console.error('Error sending message: ', error);
          });

    return webSocketOperation;
  }

  upPriority(ids: JDNHash[]) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
        JSON.stringify({
          action: WebSocketMessage.UP_PRIORITY,
          payload: { elementId: id },
        }),
      );
    });
  }

  downPriority(ids: JDNHash[]) {
    ids.forEach((id) => {
      webSocketController.sendSocket(
        JSON.stringify({
          action: WebSocketMessage.DOWN_PRIORITY,
          payload: { elementId: id },
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

  // scheduleMultipleCssSelectorGeneration() {
  //   webSocketController.sendSocket(JSON.stringify(this.CssSelectorGenerationMessage));
  // }
}

export const locatorGenerationController = new LocatorGenerationController();
