import React from "react";
import { useSelector } from "react-redux";
import { filter, isEmpty, map, reduce, size } from "lodash";
import { Button } from "antd";
import Icon from "@ant-design/icons";

import SettingsSVG from "../../../../../icons/settings.svg";
import TrashBinSVG from "../../../../../icons/trash-bin.svg";
import PauseSVG from "../../../../../icons/pause.svg";
import DownloadSvg from "../../../../../icons/download.svg";
import PlaySvg from "../../../../../icons/play.svg";
import RestoreSvg from "../../../../../icons/restore.svg";

import { useAutoFind } from "../../autoFindProvider/AutoFindProvider";
import { Chip } from "./Chip";
import { locatorTaskStatus } from "../../utils/locatorGenerationController";
import { openSettingsMenu } from "../../utils/pageDataHandlers";

export const LocatorListHeader = ({
  generatedSelected,
  waitingSelected,
  deletedSelected,
  toggleLocatorsGroup,
  toggleDeletedGroup,
  runXpathGenerationHandler,
  stopXpathGroupGeneration,
}) => {
  const [{}, { generateAndDownload }] = useAutoFind();
  const xpathConfig = useSelector((state) => state.main.xpathConfig);

  const selected = [...generatedSelected, ...waitingSelected, ...deletedSelected];
  const activeSelected = [...generatedSelected, ...waitingSelected];
  const stoppedSelected = filter(waitingSelected, (el) => el.locator.taskStatus === locatorTaskStatus.REVOKED);
  const inProgressSelected = filter(waitingSelected, (el) => el.locator.taskStatus !== locatorTaskStatus.REVOKED);

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
    openSettingsMenu(settings || xpathConfig, map(activeSelected, "element_id"));
  };

  return (
    <div className="jdn__locatorsList-header">
      <span>Locators list</span>
      <span className="jdn__locatorsList-header-buttons">
        <Chip
          hidden={!size(selected)}
          primaryLabel={size(selected)}
          secondaryLabel={"selected"}
          onDelete={() => toggleLocatorsGroup(selected)}
        />
        <Button hidden={!size(deletedSelected)} className="jdn__buttons" onClick={() => toggleDeletedGroup(selected)}>
          <Icon component={RestoreSvg} />
          Restore
        </Button>
        <Button hidden={!size(stoppedSelected)} onClick={() => runXpathGenerationHandler(stoppedSelected)}>
          <Icon component={PlaySvg} />
        </Button>
        <Button hidden={!size(inProgressSelected)} danger onClick={() => stopXpathGroupGeneration(inProgressSelected)}>
          <Icon component={PauseSVG} />
        </Button>
        <Button hidden={!size(activeSelected)} danger onClick={() => toggleDeletedGroup(activeSelected, true)}>
          <Icon fill="#D82C15" component={TrashBinSVG} />
        </Button>
        <Button id="locatorListSettings" hidden={!size(activeSelected)} onClick={handleOnClickSettings}>
          <Icon component={SettingsSVG} />
        </Button>
        <Button hidden={!size(generatedSelected)} type="primary" className="jdn__buttons" onClick={generateAndDownload}>
          <Icon component={DownloadSvg} fill="#c15f0f" />
          Download
        </Button>
      </span>
    </div>
  );
};
