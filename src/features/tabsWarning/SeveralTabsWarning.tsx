import { Alert, Button } from "antd";
import React from "react";

interface Props {
  checkSession: () => void;
}

export const SeveralTabsWarning: React.FC<Props> = ({ checkSession }) => {
  return (
    <React.Fragment>
      <Alert
        message="You can use the plugin only within 1 tab!"
        showIcon
        description="The plugin is open in several tabs now. Please leave 1 plugin tab open and continue working in it."
        type="error"
        action={
          <Button danger onClick={checkSession}>
            Retry
          </Button>
        }
      />
    </React.Fragment>
  );
};
