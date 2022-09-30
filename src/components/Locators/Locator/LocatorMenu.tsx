import React from "react";
import { useDispatch } from "react-redux";
import { Button, Dropdown } from "antd";

import { setCalculationPriority, toggleDeleted } from "../../../store/slices/locatorsSlice";

import { rerunGeneration } from "../../../store/thunks/rerunGeneration";
import { stopGeneration } from "../../../store/thunks/stopGeneration";
import { isProgressStatus, locatorGenerationController } from "../../../services/locatorGenerationController";

import { Menu, MenuItem } from "../../common/Menu";
import { Locator, LocatorCalculationPriority, LocatorTaskStatus } from "../../../store/slices/locatorSlice.types";
import { advanced, deleteOption, downPriority, edit, pause, rerun, restore, retry, upPriority } from "../menuOptions";
import { MaxGenerationTime } from "../../../store/slices/mainSlice.types";
import { DotsThree } from "phosphor-react";

interface Props {
  element: Locator;
  setIsEditModalOpen: (val: boolean) => void;
}

export const LocatorMenu: React.FC<Props> = ({ element, setIsEditModalOpen }) => {
  const dispatch = useDispatch();

  const { element_id, locator, deleted, priority, jdnHash } = element;

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

    if (deleted) {
      items = [restore(() => dispatch(toggleDeleted(element_id)))];
    } else {
      items = [
        edit(handleEditClick),
        ...(isLocatorInProgress ? [pause(() => dispatch(stopGeneration(element_id)))] : []),
        ...(isLocatorInProgress && priority !== LocatorCalculationPriority.Increased ?
          [upPriority(handleUpPriority)] :
          []),
        ...(isLocatorInProgress && priority !== LocatorCalculationPriority.Decreased ?
          [downPriority(handleDownPriority)] :
          []),
        ...(locator.taskStatus === LocatorTaskStatus.REVOKED ?
          [rerun(() => dispatch(rerunGeneration({ generationData: [element] })))] :
          []),
        ...(locator.taskStatus === LocatorTaskStatus.FAILURE ?
          [retry(() => dispatch(rerunGeneration({ generationData: [element] })))] :
          []),
        ...(locator.taskStatus === LocatorTaskStatus.SUCCESS ?
          [
            advanced([
              getRerunGeneration(1),
              getRerunGeneration(3),
              getRerunGeneration(5),
              getRerunGeneration(10),
              getRerunGeneration(60),
              getRerunGeneration(3600),
            ]),
          ] :
          []),
        deleteOption(() => dispatch(toggleDeleted(element_id))),
      ];
    }

    return <Menu {...{ items }} />;
  };

  return (
    <Dropdown
      arrow={{ pointAtCenter: true }}
      overlay={renderMenu()}
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
  );
};
