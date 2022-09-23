import { Typography } from "antd";
import {
  ArrowClockwise,
  ArrowFatDown,
  ArrowFatLinesDown,
  ArrowFatUp,
  ArrowsCounterClockwise,
  DownloadSimple,
  Pause,
  PencilSimple,
  Play,
  TextT,
  Trash,
} from "phosphor-react";
import React from "react";
import { MenuItem } from "../common/Menu";

export const restore = (onClick: () => void): MenuItem => ({
  key: "0",
  icon: <ArrowsCounterClockwise size={14} />,
  onClick,
  label: "Restore",
});

export const rerun = (onClick: () => void) => ({
  key: "1",
  icon: <Play size={14} />,
  onClick,
  label: "Rerun",
});

export const pause = (onClick: () => void) => ({
  key: "2",
  icon: <Pause size={14} />,
  label: "Pause generation",
  onClick,
});

export const upPriority = (onClick: () => void) => ({
  key: "3",
  icon: <ArrowFatUp size={14} />,
  onClick,
  label: "Up Priority",
});

export const downPriority = (onClick: () => void) => ({
  key: "4",
  icon: <ArrowFatDown size={14} />,
  onClick,
  label: "Down Priority",
});

export const edit = (onClick: () => void, label?: string) => ({
  key: "5",
  icon: <PencilSimple size={14} />,
  onClick: onClick,
  label: label || "Edit",
});

export const advanced = (onClick: Array<() => void>) => ({
  key: "7",
  icon: <ArrowFatLinesDown size={14} />,
  onClick: undefined,
  label: "Advanced calculation",
  children: [
    {
      key: "7-0",
      onClick: onClick[0],
      label: "1s",
    },
    {
      key: "7-1",
      onClick: onClick[1],
      label: "3s",
    },
    {
      key: "7-2",
      onClick: onClick[2],
      label: "5s",
    },
    {
      key: "7-3",
      onClick: onClick[3],
      label: "10s",
    },
    {
      key: "7-4",
      onClick: onClick[4],
      label: "1m",
    },
    {
      key: "7-5",
      onClick: onClick[5],
      label: "Unlimited",
    },
  ],
});

export const renameOption = (onClick: () => void): MenuItem => ({
  key: "8",
  icon: <TextT size={14} />,
  onClick: onClick,
  label: "Rename",
});

export const retry = (onClick: () => void) => ({
  key: "9",
  icon: <ArrowClockwise size={14} />,
  onClick,
  label: "Retry",
});

export const download = (onClick: () => void) => ({
  key: "10",
  icon: <DownloadSimple size={14} />,
  onClick,
  label: "Download",
});

export const deleteOption = (onClick: () => void) => ({
  key: "15",
  icon: <Trash size={14} color="#FF4D4F" />,
  onClick,
  label: <Typography.Text type="danger">Delete</Typography.Text>,
});
