import { Dropdown } from "antd";
import { size } from "lodash";
import React, { ReactNode, SyntheticEvent, useContext } from "react";
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
  addToPO,
  removeFromPO,
} from "../../../common/components/menu/menuOptions";
import { locatorGenerationController } from "../utils/locatorGenerationController";
import {
  ILocator,
  LocatorCalculationPriority,
  ValidationStatus,
  LocatorValidationWarnings,
} from "../types/locator.types";
import {
  setCalculationPriority,
  toggleDeleted,
  toggleDeletedGroup,
  toggleElementGroupGeneration,
} from "../locators.slice";
import { getCopyOptions, getLocatorValidationStatus } from "../utils/utils";
import { rerunGeneration } from "../reducers/rerunGeneration.thunk";
import { stopGenerationGroup } from "../reducers/stopGenerationGroup.thunk";
import { stopGeneration } from "../reducers/stopGeneration.thunk";
import { LocatorType } from "../../../common/types/common";
import { useSelector } from "react-redux";
import { OnboardingContext } from "../../onboarding/OnboardingProvider";
import {
  selectCalculatedActiveByPageObj,
  selectActiveNonGenerateByPO,
  selectActiveGenerateByPO,
  selectDeletedActiveByPageObj,
  selectFailedSelectedByPageObject,
  selectInProgressActiveByPageObject,
  selectActualActiveByPageObject,
  selectStoppedActiveByPageObject,
  selectInProgressActiveNoPriorityByPageObject,
  selectInProgressActiveIncPriorityByPageObject,
  selectInProgressActiveDecPriorityByPageObject,
} from "../selectors/locatorsFiltered.selectors";
import { AppDispatch } from "../../../app/store/store";

interface Props {
  setIsEditModalOpen: (val: boolean) => void;
  children?: ReactNode;
  trigger: Array<"click" | "hover" | "contextMenu">;
}

export const LocatorMenu: React.FC<Props> = ({ setIsEditModalOpen, children, trigger }) => {
  const dispatch = useDispatch<AppDispatch>();

  const activeNonGenerate = useSelector(selectActiveNonGenerateByPO);
  const activeGenerate = useSelector(selectActiveGenerateByPO);
  const deletedActive = useSelector(selectDeletedActiveByPageObj);
  const failedSelected = useSelector(selectFailedSelectedByPageObject);
  const calculatedActive = useSelector(selectCalculatedActiveByPageObj);
  const inProgressSelected = useSelector(selectInProgressActiveByPageObject);
  const actualSelected = useSelector(selectActualActiveByPageObject);
  const stoppedSelected = useSelector(selectStoppedActiveByPageObject);
  const noPrioritySelected = useSelector(selectInProgressActiveNoPriorityByPageObject);
  const increasedPrioritySelected = useSelector(selectInProgressActiveIncPriorityByPageObject);
  const decreasedPrioritySelected = useSelector(selectInProgressActiveDecPriorityByPageObject);

  // should be revised after 1240 implementation
  const isAdvancedCalculationDisabled = (element: ILocator) => {
    return element.locatorType === LocatorType.cssSelector
      ? true
      : element.message === LocatorValidationWarnings.NewElement
      ? false
      : getLocatorValidationStatus(element.message) === ValidationStatus.WARNING;
  };

  const handleEditClick = () => {
    setIsEditModalOpen(true);
  };

  const handleDelete = () => {
    actualSelected.length > 1
      ? dispatch(toggleDeletedGroup(actualSelected))
      : dispatch(toggleDeleted(actualSelected[0].element_id));
  };

  const handleUpPriority = () => {
    const hashes = [...decreasedPrioritySelected, ...noPrioritySelected].map((element) => element.jdnHash);
    const ids = [...decreasedPrioritySelected, ...noPrioritySelected].map((element) => element.element_id);
    dispatch(
      setCalculationPriority({
        ids,
        priority: LocatorCalculationPriority.Increased,
      })
    );
    locatorGenerationController.upPriority(hashes);
  };

  const handleDownPriority = () => {
    const hashes = [...increasedPrioritySelected, ...noPrioritySelected].map((element) => element.jdnHash);
    const ids = [...increasedPrioritySelected, ...noPrioritySelected].map((element) => element.element_id);
    dispatch(
      setCalculationPriority({
        ids,
        priority: LocatorCalculationPriority.Decreased,
      })
    );
    locatorGenerationController.downPriority(hashes);
  };

  const handlePause = () => {
    inProgressSelected.length > 1
      ? dispatch(stopGenerationGroup(inProgressSelected))
      : dispatch(stopGeneration(inProgressSelected[0].element_id));
  };

  const handleRestore = () => {
    deletedActive.length > 1
      ? dispatch(toggleDeletedGroup(deletedActive))
      : dispatch(toggleDeleted(deletedActive[0].element_id));
  };

  const handleMenuClick = ({ domEvent }: { domEvent: SyntheticEvent }) => {
    domEvent.stopPropagation();
  };

  const getRerunGeneration = (time: MaxGenerationTime) => () =>
    dispatch(
      rerunGeneration({
        generationData: calculatedActive.filter((el) => !isAdvancedCalculationDisabled(el)),
        maxGenerationTime: time,
      })
    );

  const handleAddToPO = () => {
    setTimeout(() => dispatch(toggleElementGroupGeneration(activeNonGenerate)), 100);
  };

  const handleRemoveFromPO = () => {
    setTimeout(() => dispatch(toggleElementGroupGeneration(activeGenerate)), 100);
  };

  const getMenuItems = () => {
    let items: MenuItem[] = [];

    items = [
      ...(size(actualSelected) === 1 ? [edit(handleEditClick)] : []),
      ...(size(activeNonGenerate) ? [addToPO(handleAddToPO)] : []),
      ...(size(activeGenerate) ? [removeFromPO(handleRemoveFromPO)] : []),
      ...(size(actualSelected) ? [copyLocatorOption(getCopyOptions(actualSelected))] : []),
      ...(size(stoppedSelected) ? [rerun(() => dispatch(rerunGeneration({ generationData: stoppedSelected })))] : []),
      ...(size(deletedActive) ? [restore(handleRestore)] : []),
      ...(size(inProgressSelected) ? [pause(handlePause)] : []),
      ...(size(inProgressSelected) && (size(decreasedPrioritySelected) || size(noPrioritySelected))
        ? [upPriority(handleUpPriority)]
        : []),
      ...(size(inProgressSelected) && (size(increasedPrioritySelected) || size(noPrioritySelected))
        ? [downPriority(handleDownPriority)]
        : []),
      ...(size(calculatedActive)
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
              size(calculatedActive) === 1 && isAdvancedCalculationDisabled(calculatedActive[0])
            ),
          ]
        : []),
      ...(size(failedSelected) ? [retry(() => dispatch(rerunGeneration({ generationData: failedSelected })))] : []),
      ...(size(actualSelected) ? [dividerItem("9-1")] : []),
      ...(size(actualSelected) ? [deleteOption(handleDelete)] : []),
    ];

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
