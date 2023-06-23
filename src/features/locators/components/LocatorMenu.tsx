import { Dropdown } from "antd";
import React, { ReactNode, SyntheticEvent, useContext, useMemo } from "react";
import { useDispatch } from "react-redux";
import { MaxGenerationTime } from "../../../app/types/mainSlice.types";
import { MenuItem } from "../../../common/components/menu/Menu";
import {
  advanced,
  deleteOption,
  downPriority,
  edit,
  pause,
  rerun,
  restore,
  retry,
  upPriority,
  copyLocatorOption,
  dividerItem,
} from "../../../common/components/menu/menuOptions";
import { isProgressStatus, locatorGenerationController } from "../utils/locatorGenerationController";
import {
  Locator,
  LocatorCalculationPriority,
  LocatorTaskStatus,
  ValidationStatus,
  LocatorValidationWarnings,
} from "../types/locator.types";
import { setCalculationPriority, toggleDeleted } from "../locators.slice";
import { getCopyOptions, getLocatorValidationStatus } from "../utils/utils";
import { rerunGeneration } from "../reducers/rerunGeneration.thunk";
import { stopGeneration } from "../reducers/stopGeneration.thunk";
import { LocatorType } from "../../../common/types/common";
import { useSelector } from "react-redux";
import {
  selectCalculatedActiveByPageObj,
  selectCurrentPageObject,
  selectWaitingActiveByPageObj,
} from "../../../features/pageObjects/pageObject.selectors";
import { OnboardingContext } from "../../onboarding/OnboardingProvider";

interface Props {
  element: Locator;
  setIsEditModalOpen: (val: boolean) => void;
  children?: ReactNode;
  trigger: Array<"click" | "hover" | "contextMenu">;
}

export const LocatorMenu: React.FC<Props> = ({ element, setIsEditModalOpen, children, trigger }) => {
  const dispatch = useDispatch();

  const { element_id, locator, deleted, priority, jdnHash, message, locatorType } = element;

  const calculatedActive = useSelector(selectCalculatedActiveByPageObj);
  const waitingActive = useSelector(selectWaitingActiveByPageObj);
  const actualSelected = useMemo(() => [...calculatedActive, ...waitingActive], [calculatedActive, waitingActive]);

  // should be revised after 1240 implementation
  const pageObject = useSelector(selectCurrentPageObject);
  const isAdvancedCalculationDisabled =
    locatorType === LocatorType.cssSelector || (!locatorType && pageObject?.locatorType === LocatorType.cssSelector)
      ? true
      : message === LocatorValidationWarnings.NewElement
      ? false
      : getLocatorValidationStatus(message) === ValidationStatus.WARNING;

  const isLocatorInProgress = isProgressStatus(locator.taskStatus);

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleUpPriority = () => {
    dispatch(
      setCalculationPriority({
        element_id,
        priority: LocatorCalculationPriority.Increased,
      })
    );
    locatorGenerationController.upPriority([jdnHash]);
  };

  const handleDownPriority = () => {
    dispatch(
      setCalculationPriority({
        element_id,
        priority: LocatorCalculationPriority.Decreased,
      })
    );
    locatorGenerationController.downPriority([jdnHash]);
  };

  const handleMenuClick = ({ domEvent }: { domEvent: SyntheticEvent }) => {
    domEvent.stopPropagation();
  };

  const getMenuItems = () => {
    const getRerunGeneration = (time: MaxGenerationTime) => () =>
      dispatch(
        rerunGeneration({
          generationData: [element],
          maxGenerationTime: time,
        })
      );

    let items: MenuItem[] = [];
    const locatorsForCopy: Locator[] = actualSelected.some((el) => el.element_id === element_id)
      ? actualSelected
      : [element];

    if (deleted) {
      items = [restore(() => dispatch(toggleDeleted(element_id)))];
    } else {
      items = [
        edit(handleEditClick),
        ...[copyLocatorOption(getCopyOptions(locatorsForCopy))],
        ...(isLocatorInProgress ? [pause(() => dispatch(stopGeneration(element_id)))] : []),
        ...(isLocatorInProgress && priority !== LocatorCalculationPriority.Increased
          ? [upPriority(handleUpPriority)]
          : []),
        ...(isLocatorInProgress && priority !== LocatorCalculationPriority.Decreased
          ? [downPriority(handleDownPriority)]
          : []),
        ...(locator.taskStatus === LocatorTaskStatus.REVOKED
          ? [rerun(() => dispatch(rerunGeneration({ generationData: [element] })))]
          : []),
        ...(locator.taskStatus === LocatorTaskStatus.FAILURE
          ? [retry(() => dispatch(rerunGeneration({ generationData: [element] })))]
          : []),
        ...(locator.taskStatus === LocatorTaskStatus.SUCCESS
          ? [
              advanced(
                [
                  getRerunGeneration(1),
                  getRerunGeneration(3),
                  getRerunGeneration(5),
                  getRerunGeneration(10),
                  getRerunGeneration(60),
                  getRerunGeneration(3600),
                ],
                isAdvancedCalculationDisabled
              ),
            ]
          : []),
        dividerItem("7-1"),
        deleteOption(() => dispatch(toggleDeleted(element_id))),
      ];
    }

    return items;
  };

  const { isOpen: isOnboardingOpen } = useContext(OnboardingContext);

  return (
    <Dropdown
      disabled={isOnboardingOpen}
      menu={{ items: getMenuItems(), onClick: handleMenuClick }}
      align={{ offset: [10, 0] }}
      trigger={trigger}
      getPopupContainer={(triggerNode) => triggerNode}
      destroyPopupOnHide
    >
      {children}
    </Dropdown>
  );
};
