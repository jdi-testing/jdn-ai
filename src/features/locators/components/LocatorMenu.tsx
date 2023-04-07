import { Dropdown } from "antd";
import React, { ReactNode, SyntheticEvent } from "react";
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
} from "../../../common/components/menu/menuOptions";
import { isProgressStatus, locatorGenerationController } from "../utils/locatorGenerationController";
import { Locator, LocatorCalculationPriority, LocatorTaskStatus, ValidationStatus } from "../types/locator.types";
import { setCalculationPriority, toggleDeleted } from "../locators.slice";
import { copyLocator, getLocatorValidationStatus } from "../utils/utils";
import { LocatorOption } from "../utils/constants";
import { rerunGeneration } from "../reducers/rerunGeneration.thunk";
import { stopGeneration } from "../reducers/stopGeneration.thunk";

interface Props {
  element: Locator;
  setIsEditModalOpen: (val: boolean) => void;
  children?: ReactNode;
  trigger: Array<"click" | "hover" | "contextMenu">;
}

export const LocatorMenu: React.FC<Props> = ({ element, setIsEditModalOpen, children, trigger }) => {
  const dispatch = useDispatch();

  const { element_id, locator, deleted, priority, jdnHash, type, name, message } = element;

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

  const renderMenu = () => {
    const getRerunGeneration = (time: MaxGenerationTime) => () =>
      dispatch(
        rerunGeneration({
          generationData: [element],
          maxGenerationTime: time,
        })
      );

    let items: MenuItem[] = [];
    const selectedLocators: Pick<Locator, "locator" | "type" | "name" | "message">[] = [
      { locator, type, name, message },
    ];

    if (deleted) {
      items = [restore(() => dispatch(toggleDeleted(element_id)))];
    } else {
      items = [
        edit(handleEditClick),
        ...[
          copyLocatorOption({
            [LocatorOption.Xpath]: copyLocator(selectedLocators, LocatorOption.Xpath),
            [LocatorOption.XpathAndSelenium]: copyLocator(selectedLocators, LocatorOption.XpathAndSelenium),
            [LocatorOption.XpathAndJDI]: copyLocator(selectedLocators, LocatorOption.XpathAndJDI),
            [LocatorOption.CSSSelector]: copyLocator(selectedLocators, LocatorOption.CSSSelector),
            [LocatorOption.FullCode]: copyLocator(selectedLocators),
          }),
        ],
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
                getLocatorValidationStatus(message) === ValidationStatus.WARNING
              ),
            ]
          : []),
        deleteOption(() => dispatch(toggleDeleted(element_id))),
      ];
    }

    return items;
  };

  return (
    <Dropdown
      menu={{ items: renderMenu(), onClick: handleMenuClick }}
      align={{ offset: [10, 0] }}
      trigger={trigger}
      getPopupContainer={(triggerNode) => triggerNode}
      destroyPopupOnHide
    >
      {children}
    </Dropdown>
  );
};
