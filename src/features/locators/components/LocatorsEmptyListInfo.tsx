import { EmptyListInfo } from "../../../common/components/emptyListInfo/EmptyListInfo";
import React from "react";
import { Button } from "antd";
import { OnboardingPopup } from "../../onboarding/components/OnboardingPopup";

interface LocatorsEmptyListInfoProps {
  setIsEditModalOpen: (isOpen: boolean) => void;
}

export const LocatorsEmptyListInfo = ({ setIsEditModalOpen }: LocatorsEmptyListInfoProps): JSX.Element => (
  <EmptyListInfo>
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
  </EmptyListInfo>
);
