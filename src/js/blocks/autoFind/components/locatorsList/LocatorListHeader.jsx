import React, { useEffect, useState } from "react";
import { filter, size } from "lodash";
import { Button } from "antd";
import Icon from "@ant-design/icons";
import { Content } from "antd/lib/layout/layout";

// import SettingsSVG from "../../../../../icons/settings.svg";
import TrashBinSVG from "../../../../../icons/trash-bin.svg";
import PauseSVG from "../../../../../icons/pause.svg";
import DownloadSvg from "../../../../../icons/download.svg";
import PlaySvg from "../../../../../icons/play.svg";
import RestoreSvg from "../../../../../icons/restore.svg";

import { useAutoFind } from "../../autoFindProvider/AutoFindProvider";
import { Chip } from "./Chip";

export const LocatorListHeader = ({
  generated,
  waiting,
  deleted,
  toggleLocatorsGroup,
  toggleDeletedGroup,
  runXpathGeneration,
  stopXpathGroupGeneration,
}) => {
  const [{ locators }, { generateAndDownload }] = useAutoFind();
  const [generatedSelected, setGeneratedSelected] = useState([]);
  const [waitingSelected, setWaitingSelected] = useState([]);
  const [deletedSelected, setDeletedSelected] = useState([]);
  const [stoppedSelected, setStoppedSelected] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    setSelected(() => filter(locators, "generate"));
  }, [locators]);

  useEffect(() => {
    setGeneratedSelected(() => filter(generated, "generate"));
  }, [generated]);

  useEffect(() => {
    const _waitingSelected = filter(waiting, "generate");
    setWaitingSelected(() => _waitingSelected);
    setStoppedSelected(() => filter(_waitingSelected, "stopped"));
  }, [waiting]);

  useEffect(() => {
    setDeletedSelected(() => filter(deleted, "generate"));
  }, [deleted]);

  return (
    <Content className="jdn__locatorsList-header">
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
        <Button hidden={!size(waitingSelected)} danger onClick={() => stopXpathGroupGeneration(waitingSelected)}>
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
          <Icon component={DownloadSvg} fill="#c15f0f" className="jdn__buttons-icons" />
          Download
        </Button>
      </span>
    </Content>
  );
};
