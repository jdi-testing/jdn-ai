import React, { useContext } from "react";

import { EmptyListInfo } from "../../../common/components/emptyListInfo/EmptyListInfo";
import { useAddPageObject } from "../utils/useAddPageObject";
import { Button, Popconfirm } from "antd";
import { OnboardingContext } from "../../../features/onboarding/OnboardingProvider";
import { OnboardingPopupText, OnboardingPopupButtons } from "../../../features/onboarding/types/constants";

interface Props {
  setActivePanel: (pageObjectId: string[] | undefined) => void;
}

export const PageObjectPlaceholder: React.FC<Props> = ({ setActivePanel }) => {
  const handleAddPageObject = useAddPageObject(setActivePanel);
  const { openOnboarding } = useContext(OnboardingContext);

  return (
    <EmptyListInfo>
      No page objects created.
      <br />
      Open a needed web-page and click the{" "}
      <Button type="link" size="small" onClick={handleAddPageObject}>
        + Page Object
      </Button>{" "}
      button to start.
      <br />
      And you can get started quickly with our{" "}
      <Popconfirm
        overlayClassName="jdn__header-onboarding-button"
        placement="bottomRight"
        align={{ offset: [18, 0] }}
        title={OnboardingPopupText.Default}
        onConfirm={openOnboarding}
        okText={OnboardingPopupButtons.Ok}
        cancelText={OnboardingPopupButtons.Cancel}
      >
        <Button type="link" size="small">
          Onboarding tutorial
        </Button>
        .
      </Popconfirm>
    </EmptyListInfo>
  );
};
