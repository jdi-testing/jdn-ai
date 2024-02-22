import { HttpEndpoint, request } from '../../services/backend';
import connector, { sendMessage } from '../../pageServices/connector';
import { SCRIPT_ERROR } from '../../common/constants/constants';
import { locatorGenerationController } from '../../features/locators/utils/LocatorGenerationController';
import { MainState } from '../types/mainSlice.types';

export const checkSession = async (setStateCallback: (val: boolean) => void) => {
  setStateCallback(false);
  sendMessage.checkSession(null).then((payloads) => {
    payloads.forEach((payload) => {
      if (payload && payload.message !== SCRIPT_ERROR.NO_CONNECTION && payload.tabId !== connector.tabId) {
        setStateCallback(true);
      }
    });
  });
};

export const initLocatorSocketController = async (xpathConfig: MainState['xpathConfig']) => {
  const sessionId = await request.get(HttpEndpoint.SESSION_ID);
  locatorGenerationController.init(sessionId, xpathConfig);
};
