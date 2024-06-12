import { failGeneration, updateLocatorGroup } from '../features/locators/locators.slice';
import { selectLocatorByJdnHash } from '../features/locators/selectors/locators.selectors';
import { ILocator, IPartialLocatorDataForUpdate, LocatorTaskStatus } from '../features/locators/types/locator.types';
import { NETWORK_ERROR, NO_ELEMENT_IN_DOCUMENT } from '../features/locators/utils/constants';
import { locatorGenerationController } from '../features/locators/utils/LocatorGenerationController';
import { sendMessage } from '../pageServices/connector';
import { webSocketController } from './webSocketController';
import { selectInProgressByPageObj } from '../features/locators/selectors/locatorsFiltered.selectors';
import {
  selectCurrentPageObject,
  selectCurrentPOLocatorType,
} from '../features/pageObjects/selectors/pageObjects.selectors';
import { selectAreInProgress } from '../features/locators/selectors/locatorsByPO.selectors';
import { selectPageDocumentForRobula } from './pageDocument/pageDocument.selectors';
import { GeneralLocatorType, LocatorType } from '../common/types/common';
import { throttler } from '../common/utils/throttler';
import {
  CssSelectorsGenerationPayload,
  WebSocketMessageEvent,
  WSResponseAction,
  XpathMultipleGenerationPayload,
} from './webSoket.types';

const isCssSelectorsGenerationPayloadGuard = (payload: any): payload is CssSelectorsGenerationPayload => {
  return (
    payload &&
    typeof payload === 'object' &&
    typeof payload.id === 'string' &&
    payload.id.startsWith('css-selectors-gen') &&
    Array.isArray(payload.result) &&
    payload.result.every(
      (res: any) => typeof res === 'object' && typeof res.id === 'string' && typeof res.result === 'string',
    )
  );
};

const reScheduledTasks = new Set();

export const updateSocketMessageHandler = (dispatch: any, state: any) => {
  const messageHandler = (event: WebSocketMessageEvent | typeof NETWORK_ERROR) => {
    if (event === NETWORK_ERROR) {
      const inProgress = selectInProgressByPageObj(state);
      const failedIds = inProgress.map(({ elementId }: ILocator) => elementId);
      dispatch(failGeneration({ ids: failedIds, errorMessage: NETWORK_ERROR }));
      return;
    }

    const { payload, action, pong, error_message: errorMessage } = JSON.parse(event.data);

    switch (action) {
      case WSResponseAction.STATUS_CHANGED: {
        const { id: jdnHash, status } = payload;
        const element = selectLocatorByJdnHash(state, jdnHash);

        if (!element) return;

        if (errorMessage === NO_ELEMENT_IN_DOCUMENT) {
          if (reScheduledTasks.has(jdnHash)) {
            reScheduledTasks.delete(jdnHash);
            dispatch(failGeneration({ ids: [element.elementId], errorMessage }));
          } else {
            reScheduledTasks.add(jdnHash);
            const rescheduleTask = async () => {
              await sendMessage.assignJdnHash({
                jdnHash: element.jdnHash,
                locatorValue: element.locatorValue.xPath ?? '',
              });
              const pageDocumentForRubula = selectPageDocumentForRobula(state);
              if (pageDocumentForRubula === null) {
                return console.error(
                  `Error: can't schedule Multiple Locator Generation: Page Document For Robula is null`,
                );
              }
              const locatorType: GeneralLocatorType = selectCurrentPOLocatorType(state) ?? LocatorType.xPath;

              locatorGenerationController.scheduleMultipleLocatorGeneration(
                locatorType,
                [element],
                pageDocumentForRubula,
              );
            };
            rescheduleTask();
          }
          break;
        }

        if (status === LocatorTaskStatus.REVOKED || status === LocatorTaskStatus.FAILURE) {
          const pageObject = selectCurrentPageObject(state)!;
          dispatch(
            updateLocatorGroup({
              locators: [{ jdnHash, locatorValue: { xPathStatus: status, cssSelectorStatus: status } }],
              pageObject,
            }),
          );
        }

        break;
      }
      case WSResponseAction.RESULT_READY: {
        let locators: IPartialLocatorDataForUpdate[] = [];
        const onStatusChange = (wsPayload: CssSelectorsGenerationPayload | XpathMultipleGenerationPayload) => {
          if (isCssSelectorsGenerationPayloadGuard(wsPayload)) {
            locators = wsPayload.result.map((res) => {
              return {
                jdnHash: res.id,
                locatorValue: {
                  cssSelector: res.result,
                  cssSelectorStatus: LocatorTaskStatus.SUCCESS,
                },
              };
            });
          } else {
            locators = [
              {
                jdnHash: wsPayload.id,
                locatorValue: {
                  xPath: wsPayload.result,
                  xPathStatus: LocatorTaskStatus.SUCCESS,
                },
              },
            ];
          }

          const pageObject = selectCurrentPageObject(state)!;
          dispatch(updateLocatorGroup({ locators, pageObject }));
        };

        throttler.accumulateAndThrottle(onStatusChange)(payload);
        break;
      }
    }
    if (pong) {
      if (!selectAreInProgress(state)) webSocketController.stopPing();
    }
  };

  webSocketController.updateMessageListener(messageHandler);
};
