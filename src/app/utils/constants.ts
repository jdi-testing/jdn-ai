import { BaseUrl } from '../types/mainSlice.types';

const devUrl = 'http://10.253.219.156:5000';
const prodUrl = 'http://10.253.219.156:80';

export const LocalUrl = 'http://localhost:5050';
export const RemoteUrl: BaseUrl = __DEV_ENVIRONMENT__ ? devUrl : prodUrl;

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
