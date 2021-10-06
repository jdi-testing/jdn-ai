import React, { useState, useEffect } from "react";
import { filter, size } from "lodash";

import { Checkbox, Collapse } from "antd";
import Icon from "@ant-design/icons";

import { WaitingList } from "./WaitingList";
import { GeneratedList } from "./GeneratedList";
import { useAutoFind } from "../../autoFindProvider/AutoFindProvider";
import { locatorProgressStatus, locatorTaskStatus } from "../../utils/locatorGenerationController";
import { DeletedList } from "./DeletedList";
import { LocatorListHeader } from "./LocatorListHeader";

import CaretDownSvg from "../../../../../icons/caret-down.svg";
import { Content } from "antd/lib/layout/layout";

export const LocatorsList = () => {
  const [
    { locators },
    { filterByProbability, toggleElementGeneration, toggleDeleted, runXpathGeneration, stopXpathGeneration },
  ] = useAutoFind();
  const [waiting, setWaiting] = useState([]);
  const [generated, setGenerated] = useState([]);
  const [deleted, setDeleted] = useState([]);

  const [generatedSelected, setGeneratedSelected] = useState([]);
  const [waitingSelected, setWaitingSelected] = useState([]);
  const [deletedSelected, setDeletedSelected] = useState([]);

  useEffect(() => {
    const byProbability = filterByProbability(locators);

    const _waiting = byProbability.filter(
        (el) =>
          (locatorProgressStatus.hasOwnProperty(el.locator.taskStatus) ||
          el.locator.taskStatus === locatorTaskStatus.REVOKED) &&
        !el.deleted
    );
    setWaiting(_waiting);
    setWaitingSelected(filter(_waiting, "generate"));

    const _generated = byProbability.filter((el) => el.locator.taskStatus === locatorTaskStatus.SUCCESS && !el.deleted);
    setGenerated(_generated);
    setGeneratedSelected(filter(_generated, "generate"));

    const _deleted = byProbability.filter((el) => el.deleted);
    setDeleted(_deleted);
    setDeletedSelected(() => filter(_deleted, "generate"));
  }, [locators]);

  const toggleLocatorsGroup = (locatorsGroup) => {
    locatorsGroup.forEach((locator) => {
      toggleElementGeneration(locator.element_id);
    });
  };

  const toggleDeletedGroup = (locatorsGroup) => {
    locatorsGroup.forEach((locator) => {
      toggleDeleted(locator.element_id);
    });
  };

  const stopXpathGroupGeneration = (locatorsGroup) => {
    locatorsGroup.forEach((locator) => {
      stopXpathGeneration(locator);
    });
  };

  const renderGroupHeader = (title, locatorsGroup, selectedGroup) => {
    const handleCheckboxChange = ({ target }) => {
      const group = filter(locatorsGroup, (loc) => loc.generate !== target.checked);
      toggleLocatorsGroup(group);
    };

    return (
      <React.Fragment>
        <Checkbox
          checked={size(locatorsGroup) && size(selectedGroup) === size(locatorsGroup)}
          indeterminate={size(selectedGroup) && size(locatorsGroup) > size(selectedGroup)}
          onChange={handleCheckboxChange}
          onClick={(event) => event.stopPropagation()}
        >
          {title}
        </Checkbox>
      </React.Fragment>
    );
  };

  return (
    <div className="jdn__locatorsList">
      <LocatorListHeader
        {...{
          generatedSelected,
          waitingSelected,
          deletedSelected,
          toggleLocatorsGroup,
          toggleDeletedGroup,
          runXpathGeneration,
          stopXpathGroupGeneration,
        }}
      />
      <div className="jdn__locatorsList-content">
        <Collapse expandIcon={({ isActive }) => <Icon component={CaretDownSvg} rotate={isActive ? 180 : 0} />}>
          <Collapse.Panel
            key="1"
            collapsible={!size(generated) ? "disabled" : ""}
            header={renderGroupHeader(`Generated (${size(generated)})`, generated, generatedSelected)}
          >
            <GeneratedList elements={generated} {...{ toggleElementGeneration }} />
          </Collapse.Panel>
          <Collapse.Panel
            key="2"
            collapsible={!size(waiting) ? "disabled" : ""}
            header={renderGroupHeader(`Waiting for generation (${size(waiting)})`, waiting, waitingSelected)}
          >
            <WaitingList elements={waiting} {...{ toggleElementGeneration }} />
          </Collapse.Panel>
          <Collapse.Panel
            key="3"
            collapsible={!size(deleted) ? "disabled" : ""}
            header={renderGroupHeader(`Deleted (${size(deleted)})`, deleted, deletedSelected)}
          >
            <DeletedList elements={deleted} {...{ toggleElementGeneration }} />
          </Collapse.Panel>
        </Collapse>
      </div>
    </div>
  );
};
