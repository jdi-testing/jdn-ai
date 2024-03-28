import React, { useEffect, useMemo, useState } from 'react';
import { Button, Progress } from 'antd';
import { size } from 'lodash';
import { useDispatch, useSelector } from 'react-redux';
import { AppDispatch, RootState } from '../../../app/store/store';
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
import cn from 'classnames';

let timer: NodeJS.Timeout;

export const LocatorsProgress = () => {
  const [isProgressActive, setIsProgressActive] = useState(false);
  const generationStatus = useSelector((state: RootState) => state.locators.present.generationStatus);

  const locatorsAll = useSelector(selectFilteredLocators);
  const generated = useSelector(selectCalculatedByPageObj);
  const inProgress = useSelector(selectInProgressByPageObj);
  const deleted = useSelector(selectDeletedByPageObj);
  const failed = useSelector(selectFailedByPageObject);
  const calculationReady = size(generated);
  const toBeCalculated = size(inProgress) + size(failed);
  const total = size(locatorsAll) - size(deleted);

  const hideProgressInformation = () => setIsProgressActive(false);

  const dispatch = useDispatch<AppDispatch>();

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

  const shouldHideInfo = readinessPercentage !== 100 && generationStatus !== LocatorsGenerationStatus.failed;
  const isGeneratedStatusFailed = generationStatus === LocatorsGenerationStatus.failed;

  const className = cn({
    'jdn__progress_hide-info': shouldHideInfo,
  });

  if (!isProgressActive) {
    return null;
  }

  return (
    <div className="jdn__locator-list-progress">
      <div className="jdn__locator-list-progress-text">
        {isGeneratedStatusFailed ? (
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
        status={isGeneratedStatusFailed ? 'exception' : undefined}
        percent={readinessPercentage}
        className={className}
      />
    </div>
  );
};
