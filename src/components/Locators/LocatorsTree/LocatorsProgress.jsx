import { Progress } from "antd";
import { size } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import {
  selectDeletedByPageObj,
  selectGeneratedByPageObj,
  selectInProgressByPageObj,
  selectPageObjLocatorsByProbability,
} from "../../../store/selectors/pageObjectSelectors";
import { locatorsGenerationStatus } from "../../../utils/constants";

let timer;

export const LocatorsProgress = ({ currentPageObject }) => {
  const [isProgressActive, setIsProgressActive] = useState(false);
  const generationStatus = useSelector((state) => state.locators.generationStatus);

  const byProbability = useSelector((_state) => selectPageObjLocatorsByProbability(_state, currentPageObject));
  const generated = useSelector((_state) => selectGeneratedByPageObj(_state, currentPageObject));
  const inProgress = useSelector((_state) => selectInProgressByPageObj(_state, currentPageObject));
  const deleted = useSelector((_state) => selectDeletedByPageObj(_state, currentPageObject));

  const calculationReady = size(generated);
  const toBeCalculated = size(inProgress);
  const total = size(byProbability) - size(deleted);

  const hideProgressInformation = () => setIsProgressActive(false);

  const readinessPercentage = useMemo(() => {
    if (!toBeCalculated && !calculationReady) {
      return 0;
    }
    const result = calculationReady / toBeCalculated;
    return result.toFixed(2) * 100;
  }, [byProbability, generated]);

  useEffect(() => {
    if (toBeCalculated && calculationReady === 0) setIsProgressActive(true);
    if (calculationReady > 0 && calculationReady === total) {
      timer = setTimeout(hideProgressInformation, 10000);
    }
    return () => clearTimeout(timer);
  }, [byProbability, generated, inProgress, deleted]);

  return (
    <div className="jdn__locatorsList-progress" style={{ display: isProgressActive ? "flex" : "none" }}>
      <Progress
        percent={readinessPercentage}
        status="active"
        showInfo={false}
        strokeColor="#1582D8"
        trailColor="black"
        strokeLinecap="square"
        strokeWidth={5}
      />
      <p className="jdn__locatorsList-progress-text">
        {toBeCalculated ?
          `${locatorsGenerationStatus.started} (${calculationReady}/${total})` :
          generationStatus}
      </p>
    </div>
  );
};
