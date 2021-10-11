import React, { useState, useEffect } from "react";
import { filter, size } from "lodash";

import { Checkbox, Collapse, Spin } from "antd";
import Icon from "@ant-design/icons";

import { useAutoFind } from "../../autoFindProvider/AutoFindProvider";
import { locatorProgressStatus, locatorTaskStatus } from "../../utils/locatorGenerationController";
import { LocatorListHeader } from "./LocatorListHeader";

import CaretDownSvg from "../../../../../icons/caret-down.svg";
import CheckedkSvg from "../../../../../icons/checked-outlined.svg";
import InvisibleSvg from "../../../../../icons/invisible.svg";
import { Locator } from "./Locator";

export const LocatorsList = () => {
  const [
    { locators, perception },
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
  }, [locators, perception]);

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

  const renderGroupHeader = (title, locatorsGroup, selectedGroup, iconComponent) => {
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
        ></Checkbox>
        {iconComponent}
        {title}
      </React.Fragment>
    );
  };

  const renderList = (elements) => {
    return elements.map((element) => {
      return (
        <Locator
          key={element.element_id}
          onChange={toggleElementGeneration}
          {...{ element, stopXpathGeneration, runXpathGeneration, toggleDeleted }}
        />
      );
    });
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
            style={{ display: !size(generated) ? "none" : "block" }}
            header={renderGroupHeader(
                `Generated (${size(generated)})`,
                generated,
                generatedSelected,
                <Icon component={CheckedkSvg} className="jdn__locatorsList-status" />
            )}
          >
            {renderList(generated)}
          </Collapse.Panel>
          <Collapse.Panel
            key="2"
            style={{ display: !size(waiting) ? "none" : "block" }}
            header={renderGroupHeader(
                `Waiting for generation (${size(waiting)})`,
                waiting,
                waitingSelected,
                <Spin size="small" />
            )}
          >
            {renderList(waiting)}
          </Collapse.Panel>
          <Collapse.Panel
            key="3"
            style={{ display: !size(deleted) ? "none" : "block" }}
            header={renderGroupHeader(
                `Deleted (${size(deleted)})`,
                deleted,
                deletedSelected,
                <Icon component={InvisibleSvg} className="jdn__locatorsList-status" />
            )}
          >
            {renderList(deleted)}
          </Collapse.Panel>
        </Collapse>
      </div>
    </div>
  );
};
