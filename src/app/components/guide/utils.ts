import { ReactElement } from "react";
import { GuideText } from "./text.constants";

export const splitMD = (source: string) => source.match(/^#+ [^#]*/gm);

export const pluginGuide = (splittedMD: Array<string>): string =>
  splittedMD.find((markdown: string) => markdown.includes("### Frontend setup")) || "";
export const serverGuide = (splittedMD: Array<string>) =>
  splittedMD.find((markdown: string) => markdown.includes("### Server setup")) || "";

export const getSteps = (pluginGuideComponent: ReactElement | null, serverGuideComponent: ReactElement | null) => [
  {
    title: "Step 1",
    key: "Step1",
    description: GuideText.FrontendSetup,
    content: pluginGuideComponent,
  },
  {
    title: "Step 2",
    key: "Step2",
    description: GuideText.ServerSetup,
    content: [serverGuideComponent],
  },
  {
    title: "Step 3",
    key: "Step3",
    description: GuideText.Check,
    content: GuideText.CheckDescription,
  },
];

export enum AlertStatus {
  Checking,
  Hide,
  Show,
}
