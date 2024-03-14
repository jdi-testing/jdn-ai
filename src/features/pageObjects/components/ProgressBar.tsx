import React, { useEffect } from 'react';
import { Progress } from 'antd';
import { useSelector } from 'react-redux';
import { selectErrorText, selectIsStarted, selectProgress, selectStage } from '../selectors/progressBar.selector';
import { updateProgress } from '../reducers/updateProgressBar.thunk';
import { useAppDispatch } from '../../../app/store/store';
import cn from 'classnames';

const stageNames: Record<number, string> = {
  1: 'Element parsing... (1/3)',
  2: 'Calculating locators visibility... (2/3)',
  3: 'Locators preparation... (3/3)',
};

const getStatus = (errorText: string, stage: number, progress: number) => {
  if (errorText) {
    return 'exception';
  }

  if (stage === 3 && progress === 100) {
    return 'success';
  }

  return 'normal';
};

const ERROR_TEXT = 'Server unavailable: check connection and settings';

const ProgressBar: React.FC = () => {
  const dispatch = useAppDispatch();
  const isStarted = useSelector(selectIsStarted);
  const stage = useSelector(selectStage);
  const progress = useSelector(selectProgress);
  const errorCode = useSelector(selectErrorText);

  const status = getStatus(errorCode, stage, progress);
  const isStatusFinished = status === 'success' || status === 'exception';

  const errorText = `${ERROR_TEXT} (${errorCode})`;
  const stageName = status === 'exception' ? errorText : stageNames[stage];

  useEffect(() => {
    if (isStarted) {
      void dispatch(updateProgress());
    }
  }, [isStarted, dispatch]);

  const className = cn({
    'progress-bar': true,
    finished: isStatusFinished,
  });

  if (!isStarted) {
    return null;
  }

  return (
    <div className="jdn_page-object-list_progress-bar-component">
      <p className="stage-name">{stageName}</p>
      <Progress className={className} percent={progress} status={status} showInfo={isStatusFinished} />
    </div>
  );
};

export default ProgressBar;
