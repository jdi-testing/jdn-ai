import { Button, Dropdown } from "antd";
import { DotsThree } from "phosphor-react";
import React from "react";
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
import { Locator, LocatorCalculationPriority, LocatorTaskStatus } from "../types/locator.types";
import { setCalculationPriority, toggleDeleted } from "../locators.slice";
import { copyLocator } from "../utils/utils";
import { LocatorOption } from "../utils/constants";
import { rerunGeneration } from "../reducers/rerunGeneration.thunk";
import { stopGeneration } from "../reducers/stopGeneration.thunk";

interface Props {
  element: Locator;
  setIsEditModalOpen: (val: boolean) => void;
}

export const LocatorMenu: React.FC<Props> = ({ element, setIsEditModalOpen }) => {
  const dispatch = useDispatch();

  const { element_id, locator, deleted, priority, jdnHash, type, name } = element;

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

  const renderMenu = () => {
    const getRerunGeneration = (time: MaxGenerationTime) => () =>
      dispatch(
        rerunGeneration({
          generationData: [element],
          maxGenerationTime: time,
        })
      );

    let items: MenuItem[] = [];
    const selectedLocators: Pick<Locator, "locator" | "type" | "name">[] = [{ locator, type, name }];

    if (deleted) {
      items = [restore(() => dispatch(toggleDeleted(element_id)))];
    } else {
      items = [
        edit(handleEditClick),
        ...[
          copyLocatorOption([
            copyLocator(selectedLocators, LocatorOption.Xpath),
            copyLocator(selectedLocators, LocatorOption.XpathAndSelenium),
            copyLocator(selectedLocators, LocatorOption.XpathAndJDI),
            () => "", // for CSS selector
            copyLocator(selectedLocators),
          ]),
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
              advanced([
                getRerunGeneration(1),
                getRerunGeneration(3),
                getRerunGeneration(5),
                getRerunGeneration(10),
                getRerunGeneration(60),
                getRerunGeneration(3600),
              ]),
            ]
          : []),
        deleteOption(() => dispatch(toggleDeleted(element_id))),
      ];
    }

    return { ...{ items } };
  };

  return (
    <div onClick={(e) => e.stopPropagation()}>
      <Dropdown
        menu={renderMenu()}
        align={{ offset: [10, 0] }}
        trigger={["click"]}
        getPopupContainer={(triggerNode) => triggerNode}
        destroyPopupOnHide
      >
        <Button
          className="jdn__locatorsList_button jdn__locatorsList_button-menu"
          icon={<DotsThree size={18} onClick={(e) => e.preventDefault()} />}
        />
      </Dropdown>
    </div>
  );
};
