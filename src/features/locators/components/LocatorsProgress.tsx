import { Button, Progress } from "antd";
import { size } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store/store";
import { Footnote } from "../../../common/components/footnote/Footnote";
import {
  selectLocatorsByPageObject,
  selectCalculatedByPageObj,
  selectInProgressByPageObj,
  selectDeletedByPageObj,
  selectFailedByPageObject,
} from "../../pageObjects/pageObject.selectors";
import { rerunGeneration } from "../reducers/rerunGeneration.thunk";
import { LocatorsGenerationStatus } from "../types/locator.types";
import { LocatorGenerationMessage } from "../types/locatorStatus.types";

let timer: NodeJS.Timeout;

export const LocatorsProgress = () => {
  const [isProgressActive, setIsProgressActive] = useState(false);
  const generationStatus = useSelector((state: RootState) => state.locators.present.generationStatus);

  const byProbability = useSelector((_state: RootState) => selectLocatorsByPageObject(_state));
  const generated = useSelector((_state: RootState) => selectCalculatedByPageObj(_state));
  const inProgress = useSelector((_state: RootState) => selectInProgressByPageObj(_state));
  const deleted = useSelector((_state: RootState) => selectDeletedByPageObj(_state));
  const failed = useSelector((_state: RootState) => selectFailedByPageObject(_state));

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
      timer = setTimeout(hideProgressInformation, 2000);
    }
    return () => clearTimeout(timer);
  }, [generated, inProgress, deleted]);

  return (
    <React.Fragment>
      {isProgressActive ? (
        <div className="jdn__locatorsList-progress">
          <div className="jdn__locatorsList-progress-text">
            <Footnote>
              {size(inProgress)
                ? `${LocatorGenerationMessage.started} (${calculationReady}/${total})`
                : LocatorGenerationMessage.complete}
            </Footnote>
            {generationStatus === LocatorsGenerationStatus.failed ? (
              <React.Fragment>
                <Footnote>{LocatorGenerationMessage.failed}</Footnote>
                <span className="ant-notification-notice-btn">
                  <Button type="text" size="small" onClick={handleRetry}>
                    Retry
                  </Button>
                </span>
              </React.Fragment>
            ) : null}
          </div>
          <Progress
            status={generationStatus === LocatorsGenerationStatus.failed ? "exception" : undefined}
            percent={readinessPercentage}
            className={
              readinessPercentage !== 100 && generationStatus !== LocatorsGenerationStatus.failed
                ? "jdn__progress_hide-info"
                : ""
            }
          />
        </div>
      ) : null}
    </React.Fragment>
  );
};
