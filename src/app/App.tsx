import React, { useEffect, useState } from 'react';
import { Provider as ReduxProvider, useDispatch, useSelector } from 'react-redux';

import 'antd/dist/reset.css';

import Layout, { Content, Header } from 'antd/lib/layout/layout';
import { Backdrop } from './components/Backdrop';
import { StatusBar } from './components/StatusBar';
import { SeveralTabsWarning } from './components/SeveralTabsWarning';
import { HttpEndpoint, request } from '../services/backend';
import { checkSession, initLocatorSocketController } from './utils/appUtils';
import { selectCurrentPage } from './main.selectors';
import { AppDispatch, RootState, store } from './store/store';
import { useOnDisconnect } from './utils/hooks/useOnDisconnect';

import { defineServer } from './reducers/defineServer.thunk';
import { Guide } from './components/guide/Guide';
import { BackendStatus } from './types/mainSlice.types';
import { setIsSessionUnique } from './main.slice';
import { LocatorsPage } from '../features/locators/LocatorsPage';
import { PageObjectPage } from '../features/pageObjects/PageObjectPage';
import { isPageObjectPage } from './utils/helpers';
import './styles/index.less';
import { Onboarding, useOnboarding } from '../features/onboarding/useOnboarding';
import { OnboardingProvider, useOnboardingContext } from '../features/onboarding/OnboardingProvider';

const App = () => {
  const [jdiTemplate, setJdiTemplate] = useState<Blob | undefined>(undefined);
  const [vividusTemplate, setVividusTemplate] = useState<Blob | undefined>(undefined);
  const backendAvailable = useSelector((state: RootState) => state.main.backendAvailable);
  const xpathConfig = useSelector((state: RootState) => state.main.xpathConfig);
  const currentPage = useSelector(selectCurrentPage);
  const dispatch = useDispatch<AppDispatch>();
  const isSessionUnique = useSelector((state: RootState) => state.main.isSessionUnique);

  const { stepsRef } = useOnboardingContext();

  useOnDisconnect();
  const updateIsSessionUnique = (isInvalidSession: boolean) => {
    store.dispatch(setIsSessionUnique(!isInvalidSession));
  };

  useEffect(() => {
    checkSession(updateIsSessionUnique); // no need to refactor, we will get rid of it in future (hopefully soon)
    dispatch(defineServer());
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      setJdiTemplate(await request.getBlob(HttpEndpoint.DOWNLOAD_TEMPLATE));
      setVividusTemplate(await request.getBlob(HttpEndpoint.DOWNLOAD_TEMPLATE_VIVIDUS));
    };

    if (backendAvailable === BackendStatus.Accessed) {
      fetchTemplates();
      initLocatorSocketController(xpathConfig);
    }
  }, [backendAvailable]);

  const renderPage = () => {
    const { page } = currentPage;
    return isPageObjectPage(page) ? <PageObjectPage {...{ jdiTemplate, vividusTemplate }} /> : <LocatorsPage />;
  };

  const {
    isOnboardingOpen,
    currentStep,
    handleCloseOnboarding,
    handleOnChangeStep,
    welcomeModal: welcomeOnboardingModal,
  } = useOnboarding();

  return (
    <>
      <div>
        <Backdrop />
        <Layout className="jdn__app">
          <Header className="jdn__header">
            <StatusBar />
          </Header>
          <Content className="jdn__content">
            {backendAvailable === BackendStatus.Accessed ? (
              !isSessionUnique ? (
                <SeveralTabsWarning {...{ checkSession: () => checkSession(updateIsSessionUnique) }} />
              ) : (
                renderPage()
              )
            ) : backendAvailable === BackendStatus.TryToAccess ? (
              BackendStatus.TryToAccess
            ) : (
              <Guide />
            )}
          </Content>
        </Layout>
      </div>
      {/* {onboarding} */}
      <Onboarding
        isOpen={isOnboardingOpen}
        steps={stepsRef}
        currentStep={currentStep}
        onClose={handleCloseOnboarding}
        onChange={handleOnChangeStep}
      />
      {welcomeOnboardingModal}
    </>
  );
};

export const ReduxApp = () => {
  return (
    <ReduxProvider {...{ store }}>
      <OnboardingProvider>
        <App />
      </OnboardingProvider>
    </ReduxProvider>
  );
};
