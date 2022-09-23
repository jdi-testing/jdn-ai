import { Button, Progress } from "antd";
import { size } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import {
  selectDeletedByPageObj,
  selectFailedByPageObject,
  selectGeneratedByPageObj,
  selectInProgressByPageObj,
  selectPageObjLocatorsByProbability,
} from "../../../store/selectors/pageObjectSelectors";
import { PageObjectId } from "../../../store/slices/pageObjectSlice.types";
import { RootState } from "../../../store/store";
import { rerunGeneration } from "../../../store/thunks/rerunGeneration";
import { locatorsGenerationStatus } from "../../../utils/constants";

interface Props {
  currentPageObject: PageObjectId;
}

let timer: NodeJS.Timeout;

export const LocatorsProgress: React.FC<Props> = ({ currentPageObject }) => {
  const [isProgressActive, setIsProgressActive] = useState(false);
  const generationStatus = useSelector((state: RootState) => state.locators.generationStatus);

  const byProbability = useSelector((_state: RootState) =>
    selectPageObjLocatorsByProbability(_state, currentPageObject)
  );
  const generated = useSelector((_state: RootState) => selectGeneratedByPageObj(_state, currentPageObject));
  const inProgress = useSelector((_state: RootState) => selectInProgressByPageObj(_state, currentPageObject));
  const deleted = useSelector((_state: RootState) => selectDeletedByPageObj(_state, currentPageObject));
  const failed = useSelector((_state: RootState) => selectFailedByPageObject(_state, currentPageObject));

  const calculationReady = size(generated);
  const toBeCalculated = size(inProgress) + size(failed);
  const total = size(byProbability) - size(deleted);

  const hideProgressInformation = () => setIsProgressActive(false);

  const dispatch = useDispatch();

  const handleRetry = () => {
    dispatch(rerunGeneration({ generationData: failed }));
  };

  const readinessPercentage = useMemo(() => {
    if (!toBeCalculated && !calculationReady) {
      return 0;
    }
    const result = calculationReady / total;
    return result * 100;
  }, [byProbability, generated, failed]);

  useEffect(() => {
    if (toBeCalculated && calculationReady === 0) setIsProgressActive(true);
    if (calculationReady > 0 && toBeCalculated === 0) {
      timer = setTimeout(hideProgressInformation, 10000);
    }
    return () => clearTimeout(timer);
  }, [generated, inProgress, deleted]);

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
        {size(inProgress) ? `${locatorsGenerationStatus.started} (${calculationReady}/${total})` : generationStatus}
        {generationStatus === locatorsGenerationStatus.failed ? (
          <span className="ant-notification-notice-btn">
            <Button type="primary" size="small" className="jdn__notification-close-btn" onClick={handleRetry}>
              Retry
            </Button>
          </span>
        ) : null}
      </p>
    </div>
  );
};
