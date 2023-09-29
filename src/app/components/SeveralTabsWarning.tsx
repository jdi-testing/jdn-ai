import { Alert, Button } from 'antd';
import React from 'react';
import { componentsTexts } from '../utils/constants';

interface Props {
  checkSession: () => void;
}

export const SeveralTabsWarning: React.FC<Props> = ({ checkSession }) => {
  return (
    <React.Fragment>
      <Alert
        message={componentsTexts.SeveralTabsWarningMessage}
        showIcon
        description={componentsTexts.SeveralTabsWarningDescription}
        type="error"
        action={
          <Button danger onClick={checkSession}>
            {componentsTexts.SeveralTabsWarningRetryButton}
          </Button>
        }
      />
    </React.Fragment>
  );
};
