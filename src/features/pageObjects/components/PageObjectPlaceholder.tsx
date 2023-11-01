import React from 'react';

import { EmptyListInfo } from '../../../common/components/emptyListInfo/EmptyListInfo';
import { useAddPageObject } from '../utils/useAddPageObject';
import { Button } from 'antd';
import { OnboardingPopup } from '../../onboarding/components/OnboardingPopup';

export const PageObjectPlaceholder: React.FC = () => {
  const handleAddPageObject = useAddPageObject();

  return (
    <EmptyListInfo>
      No page objects created.
      <br />
      Open a needed web-page and click the{' '}
      <Button type="link" size="small" onClick={handleAddPageObject}>
        + Page Object
      </Button>{' '}
      button to start.
      <br />
      And you can get started quickly with our{' '}
      <OnboardingPopup>
        <Button type="link" size="small">
          Onboarding tutorial
        </Button>
        .
      </OnboardingPopup>
    </EmptyListInfo>
  );
};
