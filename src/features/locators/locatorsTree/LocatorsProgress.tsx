import { Button, Progress } from "antd";
import { size } from "lodash";
import React, { useEffect, useMemo, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { RootState } from "../../../app/store";
import { Footnote } from "../../../common/components/footnote/Footnote";
import { locatorsGenerationStatus } from "../../../common/constants/constants";
import { rerunGeneration } from "../../../common/thunks/rerunGeneration";
import {
  selectDeletedByPageObj,
  selectFailedByPageObject,
  selectCalculatedByPageObj,
  selectInProgressByPageObj,
  selectPageObjLocatorsByProbability
} from "../../pageObjects/pageObjectSelectors";
import { PageObjectId } from "../../pageObjects/pageObjectSlice.types";

interface Props {
  currentPageObject: PageObjectId;
}

let timer: NodeJS.Timeout;

export const LocatorsProgress: React.FC<Props> = ({ currentPageObject }) => {
  const [isProgressActive, setIsProgressActive] = useState(false);
  const generationStatus = useSelector((state: RootState) => state.locators.present.generationStatus);

  const byProbability = useSelector((_state: RootState) =>
    selectPageObjLocatorsByProbability(_state, currentPageObject)
  );
  const generated = useSelector((_state: RootState) => selectCalculatedByPageObj(_state, currentPageObject));
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
              {size(inProgress) ?
                `${locatorsGenerationStatus.started} (${calculationReady}/${total})` :
                generationStatus}
            </Footnote>
            {generationStatus === locatorsGenerationStatus.failed ? (
              <span className="ant-notification-notice-btn">
                <Button type="text" size="small" onClick={handleRetry}>
                  Retry
                </Button>
              </span>
            ) : null}
          </div>
          <Progress
            status={generationStatus === locatorsGenerationStatus.failed ? "exception" : undefined}
            percent={readinessPercentage}
            className={
              readinessPercentage !== 100 && generationStatus !== locatorsGenerationStatus.failed ?
                "jdn__progress_hide-info" :
                ""
            }
          />
        </div>
      ) : null}
    </React.Fragment>
  );
};
