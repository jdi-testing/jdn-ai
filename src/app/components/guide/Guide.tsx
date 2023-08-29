import { Alert, Button, Steps, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* eslint-disable-next-line */
// @ts-ignore
// since webpack works fine with it
import readme from "../../../../README.md";
import { BackendStatus } from "../../types/mainSlice.types";
import { AppDispatch, RootState } from "../../store/store";
import { useGuideRehype } from "../../utils/useGuideRehype";
import { redefineServer } from "../../reducers/redefineServer.thunk";
import { GuideText } from "./text.constants";
import { AlertStatus, getSteps, pluginGuide, serverGuide, splitMD } from "./utils";

export const Guide = () => {
  const backendStatus = useSelector((_state: RootState) => _state.main.backendAvailable);
  const isSettingsChecking = backendStatus === BackendStatus.Retry;
  const [currentStep, setCurrentStep] = useState(0);
  const [alertStatus, setAlertStatus] = useState<AlertStatus>(AlertStatus.Hide);
  const [pluginGuideComponent, setPluginGuide] = useGuideRehype();
  const [serverGuideComponent, setServerGuide] = useGuideRehype();
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const splittedMD = splitMD(readme);
    if (!splittedMD) return;
    setPluginGuide(pluginGuide(splittedMD));
    setServerGuide(serverGuide(splittedMD));
  }, []);

  useEffect(() => {
    if (backendStatus === BackendStatus.Retry) return;
    const _step =
      backendStatus === BackendStatus.OutdatedServerLocal || backendStatus === BackendStatus.AccessFailed ? 1 : 0;
    setCurrentStep(_step);
  }, []);

  useEffect(() => {
    if (backendStatus === BackendStatus.Retry) setAlertStatus(AlertStatus.Checking);
    if (backendStatus === BackendStatus.OutdatedServerLocal)
      setAlertStatus((prevStatus) => (prevStatus === AlertStatus.Checking ? AlertStatus.Show : prevStatus));
  }, [backendStatus]);

  const steps = getSteps(pluginGuideComponent, serverGuideComponent);

  const onNextStepClick = () => {
    setCurrentStep(currentStep + 1);
  };

  const onPrevStepClick = () => {
    setCurrentStep(currentStep - 1);
  };

  const onCheckButtonClick = async () => {
    dispatch(redefineServer());
  };

  const showAlert = alertStatus === AlertStatus.Show;

  return (
    <div className="jdn__guide">
      <Typography.Title level={5}>Installation guide</Typography.Title>
      <div className="jdn__guide_content">
        <Steps current={currentStep} items={steps} />
        <div className="steps-content">{steps[currentStep].content}</div>
        {showAlert ? (
          <Alert
            type="error"
            message={GuideText.ServerError}
            description={GuideText.ServerErrorDescription}
            showIcon
            closable
          />
        ) : null}
      </div>
      <div className="jdn__navigation">
        {currentStep > 0 && <Button onClick={onPrevStepClick}>Back</Button>}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={onNextStepClick}>
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button
            type="primary"
            onClick={onCheckButtonClick}
            loading={isSettingsChecking}
            disabled={isSettingsChecking}
          >
            Check
          </Button>
        )}
      </div>
    </div>
  );
};
