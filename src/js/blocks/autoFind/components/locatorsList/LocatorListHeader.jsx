import React, { useEffect, useState } from "react";
import { filter, size } from "lodash";
import { Button } from "antd";
import Icon from "@ant-design/icons";

// import SettingsSVG from "../../../../../icons/settings.svg";
import TrashBinSVG from "../../../../../icons/trash-bin.svg";
import PauseSVG from "../../../../../icons/pause.svg";
import DownloadSvg from "../../../../../icons/download.svg";
import PlaySvg from "../../../../../icons/play.svg";
import RestoreSvg from "../../../../../icons/restore.svg";

import { useAutoFind } from "../../autoFindProvider/AutoFindProvider";
import { Chip } from "./Chip";
import { locatorTaskStatus } from "../../utils/locatorGenerationController";

export const LocatorListHeader = ({
  generatedSelected,
  waitingSelected,
  deletedSelected,
  toggleLocatorsGroup,
  toggleDeletedGroup,
  runXpathGeneration,
  stopXpathGroupGeneration,
}) => {
  const [{ locators }, { generateAndDownload }] = useAutoFind();
  const [stoppedSelected, setStoppedSelected] = useState([]);
  const [inProgressSelected, setInProgressSelected] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(() => filter(locators, "generate"));
  }, [locators]);

  useEffect(() => {
    setStoppedSelected(() => filter(waitingSelected, (el) => el.locator.taskStatus === locatorTaskStatus.REVOKED));
    setInProgressSelected(() => filter(waitingSelected, (el) => el.locator.taskStatus !== locatorTaskStatus.REVOKED));
  }, [waitingSelected]);

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
        <Button hidden={!size(stoppedSelected)} onClick={() => runXpathGeneration(stoppedSelected)}>
          <Icon component={PlaySvg} />
        </Button>
        <Button hidden={!size(inProgressSelected)} danger onClick={() => stopXpathGroupGeneration(inProgressSelected)}>
          <Icon component={PauseSVG} />
        </Button>
        <Button
          hidden={!(size(generatedSelected) + size(waitingSelected))}
          danger
          onClick={() => toggleDeletedGroup(selected)}
        >
          <Icon fill="#D82C15" component={TrashBinSVG} />
        </Button>
        {/* <Button>
          <Icon component={SettingsSVG} />
        </Button> */}
        <Button hidden={!size(generatedSelected)} type="primary" className="jdn__buttons" onClick={generateAndDownload}>
          <Icon component={DownloadSvg} fill="#c15f0f" />
          Download
        </Button>
      </span>
    </div>
  );
};
