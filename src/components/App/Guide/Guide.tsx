import { Button, Steps, Typography } from "antd";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
/* eslint-disable-next-line */
// @ts-ignore
// since webpack works fine with it
import readme from "../../../../README.md";
import { BackendStatus } from "../../../store/slices/mainSlice.types";
import { RootState } from "../../../store/store";
import { defineServer } from "../../../store/thunks/defineServer";
import { useGuideRehype } from "./useGuideRehype";

const splitMD = (source: string) => source.match(/^#+ [^#]*(?:#(?!#)[^#]*)*/gm);

const pluginGuide = (splittedMD: Array<string>): string =>
  splittedMD.find((markdown: string) => markdown.includes("**Setup plugin to Chrome**")) || "";
const serverGuide = (splittedMD: Array<string>) =>
  splittedMD.find((markdown: string) => markdown.includes("**Setup server part**")) || "";
const releaseLinks = (splittedMD: Array<string>) =>
  splittedMD.find((markdown: string) => markdown.includes("*Release version*")) || "";

export const Guide = () => {
  const backendAvailable = useSelector((_state: RootState) => _state.main.backendAvailable);
  const step =
    backendAvailable === BackendStatus.OutdatedServerLocal || backendAvailable === BackendStatus.AccessFailed ? 1 : 0;

  const [currentStep, setcurrentStep] = useState(step);
  const [pluginGuideComponent, setPluginGuide] = useGuideRehype();
  const [serverGuideComponent, setServerGuide] = useGuideRehype();
  const [linksComponent, setLinks] = useGuideRehype();
  const dispatch = useDispatch();

  useEffect(() => {
    const splittedMD = splitMD(readme);
    if (!splittedMD) return;
    setPluginGuide(pluginGuide(splittedMD));
    setServerGuide(serverGuide(splittedMD));
    setLinks(releaseLinks(splittedMD));
  }, []);

  const steps = [
    {
      title: "Step 1",
      description: "Update plugin",
      content: pluginGuideComponent,
    },
    {
      title: "Step 2",
      description: "Setup server",
      content: [serverGuideComponent, linksComponent],
    },
    {
      title: "Step 3",
      description: "Check",
      content: `The plugin will check if everything works correctly, 
      the instruction will be closed and you will be redirected to start page.`,
    },
  ];

  const next = () => {
    setcurrentStep(currentStep + 1);
  };

  const prev = () => {
    setcurrentStep(currentStep - 1);
  };

  return (
    <div className="jdn__guide">
      <Typography.Title level={5}>Installation guide</Typography.Title>
      <div className="jdn__guide_content">
        <Steps current={currentStep}>
          {steps.map((item) => (
            <Steps.Step key={item.title} title={item.title} description={item.description} />
          ))}
        </Steps>
        <div className="steps-content">{steps[currentStep].content}</div>
      </div>
      <div className="jdn__navigation">
        {currentStep > 0 && <Button onClick={() => prev()}>Back</Button>}
        {currentStep < steps.length - 1 && (
          <Button type="primary" onClick={() => next()}>
            Next
          </Button>
        )}
        {currentStep === steps.length - 1 && (
          <Button type="primary" onClick={() => dispatch(defineServer())}>
            Check
          </Button>
        )}
      </div>
    </div>
  );
};
