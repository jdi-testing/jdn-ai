import { Button } from "antd";
import { filter, isEmpty, map, reduce, size } from "lodash";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import React from "react";

import { Chip } from "./Chip";
import { generateAndDownload } from "../../services/pageObject";
import { openSettingsMenu } from "../../services/pageDataHandlers";

import DownloadSvg from "../../assets/download.svg";
import PauseSVG from "../../assets/pause.svg";
import PlaySvg from "../../assets/play.svg";
import RestoreSvg from "../../assets/restore.svg";
import SettingsSVG from "../../assets/settings.svg";
import TrashBinSVG from "../../assets/trash-bin.svg";

import { toggleDeletedGroup, toggleElementGroupGeneration } from "../../store/locatorsSlice";
import { stopGenerationGroup } from "../../store/thunks/stopGenerationGroup";
import { rerunGeneration } from "../../store/thunks/rerunGeneration";
import { locatorTaskStatus } from "../../utils/constants";
import { pushNotification } from "../../store/mainSlice";

export const LocatorListHeader = ({ generatedSelected, waitingSelected, deletedSelected }) => {
  const dispatch = useDispatch();
  const xpathConfig = useSelector((state) => state.main.xpathConfig);

  const selected = [...generatedSelected, ...waitingSelected, ...deletedSelected];
  const activeSelected = [...generatedSelected, ...waitingSelected];
  const stoppedSelected = filter(waitingSelected, (el) => el.locator.taskStatus === locatorTaskStatus.REVOKED);
  const inProgressSelected = filter(waitingSelected, (el) => el.locator.taskStatus !== locatorTaskStatus.REVOKED);
  const hasGeneratedSelected = generatedSelected?.length > 0;

  const handleOnClickSettings = () => {
    const reduceSettingsObject = (result, itemSettings) => {
      const init = { ...result };
      return reduce(
          itemSettings,
          (settingsResult, value, key) => {
            if (settingsResult[key] === itemSettings[key]) return init;
            else {
              init[key] = "indeterminate";
              return init;
            }
          },
          init
      );
    };

    const reduceSettingsArray = () => {
      return reduce(
          activeSelected,
          (result, item) => {
            const itemSettings = item.locator.settings;
            if (isEmpty(result)) return itemSettings;
            if (!itemSettings) return result;
            return reduceSettingsObject(result, itemSettings);
          },
          {}
      );
    };

    const settings = size(activeSelected) === 1 ? activeSelected[0].locator.settings : reduceSettingsArray();
    openSettingsMenu(settings || xpathConfig, map(activeSelected, "element_id"), hasGeneratedSelected);
  };

  const handleDownload = () => {
    dispatch(pushNotification("Download"));
    generateAndDownload(activeSelected);
  };

  return (
    <div className="jdn__locatorsList-header">
      <span className="jdn__locatorsList-header-title">Locators list</span>
      <Chip
        hidden={!size(selected)}
        primaryLabel={size(selected)}
        secondaryLabel={"selected"}
        onDelete={() => dispatch(toggleElementGroupGeneration(selected))}
      />
      <div className="jdn__locatorsList-header-buttons">
        <Button
          hidden={!size(deletedSelected)}
          className="jdn__buttons"
          onClick={() => dispatch(toggleDeletedGroup(deletedSelected))}
        >
          <Icon component={RestoreSvg} />
          Restore
        </Button>
        <Button hidden={!size(stoppedSelected)} onClick={() => dispatch(rerunGeneration(stoppedSelected))}>
          <Icon component={PlaySvg} />
        </Button>
        <Button
          hidden={!size(inProgressSelected)}
          danger
          onClick={() => dispatch(stopGenerationGroup(inProgressSelected))}
        >
          <Icon component={PauseSVG} />
        </Button>
        <Button
          hidden={!size(activeSelected)}
          danger
          onClick={() => dispatch(toggleDeletedGroup(activeSelected, true))}
        >
          <Icon fill="#D82C15" component={TrashBinSVG} />
        </Button>
        <Button id="locatorListSettings" hidden={!size(activeSelected)} onClick={handleOnClickSettings}>
          <Icon component={SettingsSVG} />
        </Button>
        <Button hidden={!size(generatedSelected)} type="primary" className="jdn__buttons" onClick={handleDownload}>
          <Icon component={DownloadSvg} fill="#c15f0f" />
          Download
        </Button>
      </div>
    </div>
  );
};
