import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { filter, size } from "lodash";

import { Checkbox, Collapse, Spin } from "antd";
import Icon from "@ant-design/icons";
import { Progress } from "antd";
import { isProgressStatus, locatorTaskStatus } from "../../utils/locatorGenerationController";
import { LocatorListHeader } from "./LocatorListHeader";
import { Notifications } from "./Notifications";

import CaretDownSvg from "../../../../../icons/caret-down.svg";
import CheckedkSvg from "../../../../../icons/checked-outlined.svg";
import DeletedSvg from "../../../../../icons/deleted.svg";
import { Locator } from "./Locator";
import { toggleElementGroupGeneration } from "../../redux/predictionSlice";
import { selectLocatorsByProbability } from "../../redux/selectors";

export const LocatorsList = () => {
  const dispatch = useDispatch();

  const state = useSelector((state) => state);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const xpathStatus = useSelector((state) => state.main.xpathStatus);
  const [activePanel, setActivePanel] = useState();
  const [isProgressActive, setIsProgressActive] = useState(false);

  const byProbability = selectLocatorsByProbability(state);

  const waiting = useMemo(
      () =>
        byProbability.filter(
            (el) =>
              (isProgressStatus(el.locator.taskStatus) ||
            el.locator.taskStatus === locatorTaskStatus.REVOKED ||
            el.locator.taskStatus === locatorTaskStatus.FAILURE) &&
          !el.deleted
        ),
      [byProbability]
  );
  const generated = useMemo(
      () => byProbability.filter((el) => el.locator.taskStatus === locatorTaskStatus.SUCCESS && !el.deleted),
      [byProbability]
  );
  const deleted = useMemo(() => byProbability.filter((el) => el.deleted), [byProbability]);

  const waitingSelected = filter(waiting, "generate");
  const generatedSelected = filter(generated, "generate");
  const deletedSelected = filter(deleted, "generate");

  const hasGeneratedSelected = useMemo(
      () => size(generatedSelected) > 0 && size(generatedSelected) !== size(generated),
      [generatedSelected, generated]
  );

  const hasWaitingSelected = useMemo(() => size(waitingSelected) > 0 && size(waitingSelected) !== size(waiting), [
    waitingSelected,
    waiting,
  ]);

  const togglePanel = useCallback((panel) => {
    setActivePanel(panel);
  }, []);

  const renderGroupHeader = (title, locatorsGroup, selectedGroup, iconComponent) => {
    const handleCheckboxChange = ({ target }) => {
      const group = filter(locatorsGroup, (loc) => loc.generate !== target.checked);
      dispatch(toggleElementGroupGeneration(group));
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

  const renderList = (elements, selectedElements) => {
    return elements.map((element) => {
      return (
        <Locator
          key={element.element_id}
          noScrolling={size(elements) && size(selectedElements) === size(elements)}
          {...{ element, xpathConfig }}
        />
      );
    });
  };

  const readinessPercentage = useMemo(() => {
    const readyCount = size(generated);
    const total = size(byProbability);
    if (!total && !readyCount) {
      return 0;
    }
    const result = readyCount / total;
    return result.toFixed(2) * 100;
  }, [byProbability, generated]);

  useEffect(() => {
    if (hasGeneratedSelected) {
      setActivePanel("1");
    }
  }, [hasGeneratedSelected]);

  useEffect(() => {
    if (hasWaitingSelected) {
      setActivePanel("2");
    }
  }, [hasWaitingSelected]);

  function hideProgressInformation() {
    setIsProgressActive(true);
  }

  useEffect(() => {
    const readyCount = size(generated);
    const total = size(byProbability);
    if (readyCount > 0 && total > 0 && readyCount === total) {
      setTimeout(hideProgressInformation, 10000);
    }
  });

  return (
    <div className="jdn__locatorsList">
      <LocatorListHeader
        {...{
          generatedSelected,
          waitingSelected,
          deletedSelected,
        }}
      />
      <div className="jdn__locatorsList-content">
        <Collapse
          className="jdn__collapse"
          onChange={togglePanel}
          activeKey={activePanel}
          accordion
          expandIcon={({ isActive }) => <Icon component={CaretDownSvg} rotate={isActive ? 180 : 0} />}
        >
          {size(generated) && (
            <Collapse.Panel
              key="1"
              header={renderGroupHeader(
                  `Generated (${size(generated)})`,
                  generated,
                  generatedSelected,
                  <Icon component={CheckedkSvg} className="jdn__locatorsList-status" />
              )}
              className="jdn__collapse-panel"
            >
              {renderList(generated, generatedSelected)}
            </Collapse.Panel>
          )}
          {size(waiting) && (
            <Collapse.Panel
              key="2"
              style={{ display: !size(waiting) ? "none" : "block" }}
              header={renderGroupHeader(
                  `Waiting for generation (${size(waiting)})`,
                  waiting,
                  waitingSelected,
                  <Spin size="small" />
              )}
              className={`jdn__collapse-panel ${size(deleted) ? "jdn__collapse-panel-middle" : ""}`}
            >
              {renderList(waiting, waitingSelected)}
            </Collapse.Panel>
          )}
          <Collapse.Panel
            key="3"
            style={{ display: !size(deleted) ? "none" : "block" }}
            header={renderGroupHeader(
                `Deleted (${size(deleted)})`,
                deleted,
                deletedSelected,
                <Icon component={DeletedSvg} className="jdn__locatorsList-status" />
            )}
            className="jdn__collapse-panel"
          >
            {renderList(deleted, deletedSelected)}
          </Collapse.Panel>
        </Collapse>
        <div>
          <Notifications {...{ deletedSelected, generatedSelected }} />
          <div className="jdn__locatorsList-progress">
            <Progress
              percent={readinessPercentage}
              status="active"
              showInfo={false}
              strokeColor="#1582D8"
              trailColor="black"
              strokeLinecap="square"
              strokeWidth={5}
              style={{ display: isProgressActive ? "none" : "flex" }}
            />
            <p className="jdn__locatorsList-progress-text" style={{ display: isProgressActive ? "none" : "flex" }}>
              {size(waiting) ? xpathStatus : `Locators generation is successfully completed`}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
