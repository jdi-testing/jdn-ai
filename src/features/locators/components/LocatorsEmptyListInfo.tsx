import { EmptyListInfo } from "../../../common/components/emptyListInfo/EmptyListInfo";
import React from "react";
import { Button } from "antd";
import { OnboardingPopup } from "../../onboarding/components/OnboardingPopup";
import { EmptyListText } from "../text.constants";

interface LocatorsEmptyListInfoProps {
  setIsEditModalOpen: (isOpen: boolean) => void;
  isNoPageLocators: boolean;
}

export const LocatorsEmptyListInfo = ({
  setIsEditModalOpen,
  isNoPageLocators,
}: LocatorsEmptyListInfoProps): JSX.Element => (
  <EmptyListInfo>
    {isNoPageLocators ? (
      <>
        You can either create a{" "}
        <Button type="link" onClick={() => setIsEditModalOpen(true)}>
          Custom locator
        </Button>{" "}
        or refer to our{" "}
        <OnboardingPopup>
          <Button type="link" size="small">
            Onboarding tutorial
          </Button>
          .
        </OnboardingPopup>{" "}
        to understand the JDN features
      </>
    ) : (
      EmptyListText
    )}
  </EmptyListInfo>
);
