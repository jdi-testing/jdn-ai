import { Progress } from "antd";
import { size } from "lodash";
import React, { useEffect, useMemo } from "react";
import { useSelector } from "react-redux";
import {
  selectDeletedByPageObj,
  selectGeneratedByPageObj,
  selectPageObjLocatorsByProbability,
  selectWaitingByPageObj,
} from "../../store/selectors/pageObjectSelectors";
import { locatorsGenerationStatus } from "../../utils/constants";

let timer;

export const LocatorsProgress = ({ currentPageObject, isProgressActive, setIsProgressActive }) => {
  const generationStatus = useSelector((state) => state.locators.generationStatus);

  const byProbability = useSelector((_state) => selectPageObjLocatorsByProbability(_state, currentPageObject));
  const generated = useSelector((_state) => selectGeneratedByPageObj(_state, currentPageObject));
  const waiting = useSelector((_state) => selectWaitingByPageObj(_state, currentPageObject));
  const deleted = useSelector((_state) => selectDeletedByPageObj(_state, currentPageObject));

  const hideProgressInformation = () => setIsProgressActive(false);

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
    const readyCount = size(generated);
    const total = size(byProbability) - size(deleted);
    if (readyCount > 0 && total > 0 && readyCount === total) {
      timer = setTimeout(hideProgressInformation, 10000);
    }
    return () => clearTimeout(timer);
  }, [byProbability, generated, deleted]);

  return (
    <div className="jdn__locatorsList-progress">
      <Progress
        percent={readinessPercentage}
        status="active"
        showInfo={false}
        strokeColor="#1582D8"
        trailColor="black"
        strokeLinecap="square"
        strokeWidth={5}
        style={{ display: isProgressActive ? "flex" : "none" }}
      />
      <p className="jdn__locatorsList-progress-text" style={{ display: isProgressActive ? "flex" : "none" }}>
        {size(waiting) ? locatorsGenerationStatus.started : generationStatus}
      </p>
    </div>
  );
};
