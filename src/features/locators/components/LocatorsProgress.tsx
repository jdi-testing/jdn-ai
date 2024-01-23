import React, { useEffect, useMemo, useState } from 'react';
import { Button, Progress } from 'antd';
import { size } from 'lodash';
import { useSelector } from 'react-redux';
import { RootState, useAppDispatch } from '../../../app/store/store';
import { Footnote } from '../../../common/components/footnote/Footnote';
import { rerunGeneration } from '../reducers/rerunGeneration.thunk';
import { LocatorsGenerationStatus } from '../types/locator.types';
import { LocatorGenerationMessage } from '../types/locatorStatus.types';
import {
  selectFilteredLocators,
  selectCalculatedByPageObj,
  selectInProgressByPageObj,
  selectDeletedByPageObj,
  selectFailedByPageObject,
} from '../selectors/locatorsFiltered.selectors';

let timer: NodeJS.Timeout;

export const LocatorsProgress = () => {
  const [isProgressActive, setIsProgressActive] = useState(false);
  const generationStatus = useSelector((state: RootState) => state.locators.present.generationStatus);

  const locatorsAll = useSelector((_state: RootState) => selectFilteredLocators(_state));
  const generated = useSelector((_state: RootState) => selectCalculatedByPageObj(_state));
  const inProgress = useSelector((_state: RootState) => selectInProgressByPageObj(_state));
  const deleted = useSelector((_state: RootState) => selectDeletedByPageObj(_state));
  const failed = useSelector((_state: RootState) => selectFailedByPageObject(_state));

  const calculationReady = size(generated);
  const toBeCalculated = size(inProgress) + size(failed);
  const total = size(locatorsAll) - size(deleted);

  const hideProgressInformation = () => setIsProgressActive(false);

  const dispatch = useAppDispatch();

  const handleRetry = () => {
    dispatch(rerunGeneration({ generationData: failed }));
  };

  const readinessPercentage = useMemo(() => {
    if (!toBeCalculated && !calculationReady) {
      return 0;
    }
    const result = calculationReady / total;
    return result * 100;
  }, [locatorsAll, generated, failed]);

  useEffect(() => {
    if (toBeCalculated && calculationReady === 0) setIsProgressActive(true);
    if (!size(inProgress)) {
      timer = setTimeout(hideProgressInformation, 2000);
    }
    return () => clearTimeout(timer);
  }, [generated, inProgress, deleted]);

  return (
    <>
      {isProgressActive ? (
        <div className="jdn__locatorsList-progress">
          <div className="jdn__locatorsList-progress-text">
            {generationStatus === LocatorsGenerationStatus.failed ? (
              <>
                <Footnote>{LocatorGenerationMessage.failed}</Footnote>
                <span className="ant-notification-notice-btn">
                  <Button type="text" size="small" onClick={handleRetry}>
                    Retry
                  </Button>
                </span>
              </>
            ) : (
              <Footnote>
                {size(inProgress)
                  ? `${LocatorGenerationMessage.started} (${calculationReady}/${total})`
                  : size(failed)
                  ? `${LocatorGenerationMessage.completeWithErrors} (${calculationReady}/${total})`
                  : `${LocatorGenerationMessage.complete}`}
              </Footnote>
            )}
          </div>
          <Progress
            status={generationStatus === LocatorsGenerationStatus.failed ? 'exception' : undefined}
            percent={readinessPercentage}
            className={
              readinessPercentage !== 100 && generationStatus !== LocatorsGenerationStatus.failed
                ? 'jdn__progress_hide-info'
                : ''
            }
          />
        </div>
      ) : null}
    </>
  );
};
