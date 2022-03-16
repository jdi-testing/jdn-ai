import { Checkbox, Collapse, Spin } from "antd";
import { filter, size } from "lodash";
import { Progress } from "antd";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@ant-design/icons";
import React, { useEffect, useMemo, useState, useCallback } from "react";

import { Locator } from "./Locator";
import { LocatorListHeader } from "./LocatorListHeader";
import { Notifications } from "./Notifications";
import { toggleElementGroupGeneration } from "../../store/slices/locatorsSlice";

import CaretDownSvg from "../../assets/caret-down.svg";
import CheckedkSvg from "../../assets/checked-outlined.svg";
import DeletedSvg from "../../assets/deleted.svg";
import {
  selectDeletedByPageObj,
  selectDeletedSelectedByPageObj,
  selectGeneratedByPageObj,
  selectGeneratedSelectedByPageObj,
  selectPageObjLocatorsByProbability,
  selectWaitingByPageObj,
  selectWaitingSelectedByPageObj,
} from "../../store/selectors/pageObjectSelectors";

let timer;

export const LocatorsList = ({ pageObject }) => {
  const dispatch = useDispatch();

  const state = useSelector((state) => state);
  const xpathConfig = useSelector((state) => state.main.xpathConfig);
  const xpathStatus = useSelector((state) => state.main.xpathStatus);
  const currentPageObject = pageObject ? pageObject.id : useSelector((state) => state.pageObject.currentPageObject);
  const [activePanel, setActivePanel] = useState("1");
  const [isProgressActive, setIsProgressActive] = useState(false);

  const byProbability = selectPageObjLocatorsByProbability(state, currentPageObject);

  const waiting = useSelector((_state) => selectWaitingByPageObj(_state, currentPageObject));
  const generated = useSelector((_state) => selectGeneratedByPageObj(_state, currentPageObject));
  const deleted = useSelector((_state) => selectDeletedByPageObj(_state, currentPageObject));

  const waitingSelected = useSelector((_state) => selectWaitingSelectedByPageObj(_state, currentPageObject));
  const generatedSelected = useSelector((_state) => selectGeneratedSelectedByPageObj(_state, currentPageObject));
  const deletedSelected = useSelector((_state) => selectDeletedSelectedByPageObj(_state, currentPageObject));

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
    const total = size(byProbability) - size(deleted);
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
    const total = size(byProbability) - size(deleted);
    if (readyCount > 0 && total > 0 && readyCount === total) {
      timer = setTimeout(hideProgressInformation, 10000);
    }
    return () => clearTimeout(timer);
  }, [byProbability, generated, deleted]);

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
          className="jdn__sticky-collapse"
          onChange={togglePanel}
          activeKey={activePanel}
          accordion
          expandIcon={({ isActive }) => <Icon component={CaretDownSvg} rotate={isActive ? 180 : 0} fill="#808080" />}
          expandIconPosition="right"
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
              className="jdn__sticky-collapse-panel"
            >
              {renderList(generated, generatedSelected)}
            </Collapse.Panel>
          )}
          {size(waiting) && (
            <Collapse.Panel
              key="2"
              header={renderGroupHeader(
                  `Waiting for generation (${size(waiting)})`,
                  waiting,
                  waitingSelected,
                  <Spin size="small" />
              )}
              className={`jdn__sticky-collapse-panel ${size(deleted) ? "jdn__sticky-collapse-panel-middle" : ""}`}
            >
              {renderList(waiting, waitingSelected)}
            </Collapse.Panel>
          )}
          {size(deleted) && (
            <Collapse.Panel
              key="3"
              header={renderGroupHeader(
                  `Deleted (${size(deleted)})`,
                  deleted,
                  deletedSelected,
                  <Icon component={DeletedSvg} className="jdn__locatorsList-status" />
              )}
              className="jdn__sticky-collapse-panel"
            >
              {renderList(deleted, deletedSelected)}
            </Collapse.Panel>
          )}
        </Collapse>
        <div>
          <Notifications />
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
