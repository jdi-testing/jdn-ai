import { BaseUrl } from '../types/mainSlice.types';

export const LocalUrl = 'http://localhost:5050';
export const RemoteUrl = `http://10.253.219.156:${__DEV_ENVIRONMENT__ ? '5000' : '80'}` as BaseUrl;

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
