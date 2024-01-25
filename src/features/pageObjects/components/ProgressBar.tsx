import React, { useEffect } from 'react';
import { Progress } from 'antd';
import { useSelector } from 'react-redux';
import { selectIsStarted, selectProgress, selectStage } from '../selectors/progressBar.selector';
import { updateProgress } from '../reducers/updateProgressBar.thunk';
import { useAppDispatch } from '../../../app/store/store';

const stageNames: Record<number, string> = {
  1: 'Element parsing... (1/3)',
  2: 'Calculating locators visibility... (2/3)',
  3: 'Locators preparation... (3/3)',
};

type ProgressBarViewProps = {
  stageName: string;
  progress: number;
  status: 'normal' | 'success';
};

const ProgressBarView: React.FC<ProgressBarViewProps> = ({ stageName, progress, status }) => {
  return (
    <div className="jdn_page-object-list_progress-bar-component">
      <p className="stage-name">{stageName}</p>
      <Progress
        className={`progress-bar${status === 'success' ? ' success' : ''}`}
        percent={progress}
        status={status}
        showInfo={status === 'success'}
      />
    </div>
  );
};

const ProgressBarController: React.FC = () => {
  const dispatch = useAppDispatch();
  const isStarted = useSelector(selectIsStarted);
  const stage = useSelector(selectStage);
  const progress = useSelector(selectProgress);
  const status = stage === 3 && progress === 100 ? 'success' : 'normal';

  useEffect(() => {
    if (isStarted) {
      void dispatch(updateProgress());
    }
  }, [isStarted, dispatch]);

  return isStarted ? <ProgressBarView stageName={stageNames[stage]} progress={progress} status={status} /> : null;
};

export default ProgressBarController;