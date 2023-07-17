import { debouncer } from "../common/utils/debouncer";
import { failGeneration, updateLocatorGroup } from "../features/locators/locators.slice";
import { selectLocatorByJdnHash } from "../features/locators/selectors/locators.selectors";
import { Locator, LocatorTaskStatus } from "../features/locators/types/locator.types";
import { NETWORK_ERROR, NO_ELEMENT_IN_DOCUMENT } from "../features/locators/utils/constants";
import { locatorGenerationController } from "../features/locators/utils/locatorGenerationController";
import { sendMessage } from "../pageServices/connector";
import { webSocketController } from "./webSocketController";
import { selectInProgressByPageObj } from "../features/locators/selectors/locatorsFiltered.selectors";

const reScheduledTasks = new Set();

export const updateSocketMessageHandler = (dispatch: any, state: any) => {
  const messageHandler = (event: any) => {
    if (event === NETWORK_ERROR) {
      const inProgress = selectInProgressByPageObj(state);
      const failedIds = inProgress.map(({ element_id }: Locator) => element_id);
      dispatch(failGeneration({ ids: failedIds, errorMessage: NETWORK_ERROR }));
      return;
    }

    const { payload, action, result, pong, error_message: errorMessage } = JSON.parse(event.data);

    switch (action || result) {
      case "status_changed": {
        const { id: jdnHash, status } = payload;
        const element = selectLocatorByJdnHash(state, jdnHash)!;

        if (errorMessage === NO_ELEMENT_IN_DOCUMENT) {
          if (reScheduledTasks.has(jdnHash)) {
            reScheduledTasks.delete(jdnHash);
            dispatch(failGeneration({ ids: [element.element_id], errorMessage }));
          } else {
            reScheduledTasks.add(jdnHash);
            const rescheduleTask = async () => {
              await sendMessage.assignJdnHash({ jdnHash: element.jdnHash, locator: element.locator.xPath });
              locatorGenerationController.scheduleMultipleXpathGeneration([element]);
            };
            rescheduleTask();
          }
          break;
        }

        if (status === LocatorTaskStatus.REVOKED || status === LocatorTaskStatus.FAILURE) {
          dispatch(updateLocatorGroup([{ ...element, locator: { ...element.locator, ...{ taskStatus: status } } }]));
        }

        break;
      }
      case "result_ready": {
        const onStatusChange = (payloads: any[]) => {
          const locators = payloads.map((_payload) => {
            const { id: jdnHash, result: xPath } = _payload;
            const element = selectLocatorByJdnHash(state, jdnHash)!;
            return { ...element, locator: { ...element.locator, ...{ xPath, taskStatus: LocatorTaskStatus.SUCCESS } } };
          });
          dispatch(updateLocatorGroup(locators));
        };
        debouncer.accumulateAndDebounce(onStatusChange)([payload]);
        break;
      }
    }
    if (pong) {
      const areInProgress = selectInProgressByPageObj(state).length > 0;
      if (!areInProgress) webSocketController.stopPing();
    }
  };

  webSocketController.updateMessageListener(messageHandler);
};
