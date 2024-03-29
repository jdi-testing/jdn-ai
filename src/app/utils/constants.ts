import { BaseUrl } from '../types/mainSlice.types';

export const URL: { [key: string]: BaseUrl } = {
  devRemote: 'http://78.47.220.208:5000',
  prodRemote: 'http://78.47.220.208:80',
  local: 'http://localhost:5050',
};

export const RemoteUrl: BaseUrl = __DEV_ENVIRONMENT__ ? URL.devRemote : URL.prodRemote;

export enum componentsTexts {
  SeveralTabsWarningMessage = 'You can use the plugin only within 1 tab!',
  SeveralTabsWarningDescription = 'The plugin is open in several tabs now. Please leave 1 plugin tab open and continue working in it.',
  SeveralTabsWarningRetryButton = 'Retry',
  StatusBarVersionJdn = 'JDN v',
  StatusBarVersionBackend = 'Back-end v',
  StatusBarVersionReadme = 'Readme',
  StatusBarServerNoConnection = 'No connection',
  StatusBarLocalServer = 'Local server',
  StatusBarRemoteServer = 'Remote server',
  OnboardingButtonTitle = 'Onboarding tutorial',
}
