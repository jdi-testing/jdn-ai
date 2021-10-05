import React, { useState, useEffect } from "react";
import { Collapse } from "antd";
import { WaitingList } from "./WaitingList";
import { GeneratedList } from "./GeneratedList";
import { useAutoFind } from "../../autoFindProvider/AutoFindProvider";
import { locatorProgressStatus, locatorTaskStatus } from "../../utils/locatorGenerationController";
import { DeletedList } from "./DeletedList";
import { LocatorListHeader } from "./LocatorListHeader";

export const LocatorsList = () => {
  const [
    { locators },
    { filterByProbability, toggleElementGeneration, toggleDeleted, runXpathGeneration, stopXpathGeneration },
  ] = useAutoFind();
  const [waiting, setWaiting] = useState([]);
  const [generated, setGenerated] = useState([]);
  const [deleted, setDeleted] = useState([]);

  useEffect(() => {
    const byProbability = filterByProbability(locators);

    setWaiting(
        byProbability.filter(
            (el) =>
              (locatorProgressStatus.hasOwnProperty(el.locator.taskStatus) ||
            el.locator.taskStatus === locatorTaskStatus.REVOKED) &&
          !el.deleted
        )
    );

    setGenerated(byProbability.filter((el) => el.locator.taskStatus === locatorTaskStatus.SUCCESS && !el.deleted));

    setDeleted(byProbability.filter((el) => el.deleted));
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

  return (
    <div className="jdn__locatorsList">
      <LocatorListHeader
        {...{
          generated,
          waiting,
          deleted,
          toggleLocatorsGroup,
          toggleDeletedGroup,
          runXpathGeneration,
          stopXpathGroupGeneration,
        }}
      />
      <Collapse defaultActiveKey={["1", "2", "3"]}>
        <Collapse.Panel key="1" header="Generated">
          <GeneratedList elements={generated} {...{ toggleElementGeneration }} />
        </Collapse.Panel>
        <Collapse.Panel key="2" header="Waiting for generation">
          <WaitingList elements={waiting} {...{ toggleElementGeneration }} />
        </Collapse.Panel>
        <Collapse.Panel key="3" header="Deleted">
          <DeletedList elements={deleted} {...{ toggleElementGeneration }} />
        </Collapse.Panel>
      </Collapse>
    </div>
  );
};
