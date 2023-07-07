import { Button, Steps, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* eslint-disable-next-line */
// @ts-ignore
// since webpack works fine with it
import readme from "../../../README.md";
import { BackendStatus } from "../types/mainSlice.types";
import { RootState } from "../store/store";
import { defineServer } from "../reducers/defineServer.thunk";
import { useGuideRehype } from "../utils/useGuideRehype";

const splitMD = (source: string) => source.match(/^#+ [^#]*/gm);

const pluginGuide = (splittedMD: Array<string>): string =>
  splittedMD.find((markdown: string) => markdown.includes("### Frontend setup")) || "";
const serverGuide = (splittedMD: Array<string>) =>
  splittedMD.find((markdown: string) => markdown.includes("### Server setup")) || "";

export const Guide = () => {
  const backendStatus = useSelector((_state: RootState) => _state.main.backendAvailable);
  const step =
    backendStatus === BackendStatus.OutdatedServerLocal || backendStatus === BackendStatus.AccessFailed ? 1 : 0;
  const [isSettingsChecking, setSettingsChecking] = useState(false);
  const [currentStep, setCurrentStep] = useState(step);
  const [pluginGuideComponent, setPluginGuide] = useGuideRehype();
  const [serverGuideComponent, setServerGuide] = useGuideRehype();
  const dispatch = useDispatch();

  useEffect(() => {
    const splittedMD = splitMD(readme);
    if (!splittedMD) return;
    setPluginGuide(pluginGuide(splittedMD));
    setServerGuide(serverGuide(splittedMD));
  }, []);

  const steps = [
    {
      title: "Step 1",
      key: "Step1",
      description: "Frontend setup",
      content: pluginGuideComponent,
    },
    {
      title: "Step 2",
      key: "Step2",
      description: "Server setup",
      content: [serverGuideComponent],
    },
    {
      title: "Step 3",
      key: "Step3",
      description: "Check",
      content:
        "The plugin will check if everything works correctly, the instruction will be closed and you will be redirected to start page.",
    },
  ];

  const onNextStepClick = () => {
    setCurrentStep(currentStep + 1);
  };

  const onPrevStepClick = () => {
    setCurrentStep(currentStep - 1);
  };

  const onCheckButtonClick = async () => {
    setSettingsChecking(true);
    dispatch(defineServer());
  };

  return (
    <div className="jdn__guide">
      <Typography.Title level={5}>Installation guide</Typography.Title>
      <div className="jdn__guide_content">
        <Steps current={currentStep} items={steps} />
        <div className="steps-content">{steps[currentStep].content}</div>
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
