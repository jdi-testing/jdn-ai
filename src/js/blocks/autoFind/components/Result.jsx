import { Space } from "antd";
import { Content } from "antd/lib/layout/layout";
import Text from "antd/lib/typography/Text";
import React from "react";
import { autoFindStatus, useAutoFind } from "../autoFindProvider/AutoFindProvider";

const hideStatus = [autoFindStatus.loading, autoFindStatus.removed];

export const Result = () => {
  const [
    {
      status,
      predictedElements,
      pageElements,
      allowRemoveElements,
      unreachableNodes,
      availableForGeneration,
      xpathStatus,
      unactualPrediction,
    },
  ] = useAutoFind();

  const getPredictedElements = () => {
    return predictedElements && allowRemoveElements ? predictedElements.length : 0;
  };

  const renderStatus = () => {
    if (hideStatus.includes(status)) return null;
    if (unactualPrediction) {
      return (
        <Text type="warning">
          Prediction is not actual anymore. Please, remove highlight and re-run identification.
        </Text>
      );
    } else if (unreachableNodes && unreachableNodes.length) {
      return <Text type="danger">{`${unreachableNodes.length} controls are unreachable due to DOM updates.`}</Text>;
    } else {
      return <Text type="success">{status}</Text>;
    }
  };

  return (
    <Content hidden={hideStatus.includes(status) || !status}>
      <div className="jdn__result-status">{renderStatus()}</div>
      <Space size={36} direction="horizontal">
        <div>
          <span className="jdn__result-count">{pageElements || 0}</span>
          found on page
        </div>
        <div>
          <span className="jdn__result-count">{getPredictedElements()}</span>
          predicted
        </div>
        <div>
          <span className="jdn__result-count">{availableForGeneration.length}</span>
          available for generation
        </div>
        <div>
          <span className="jdn__result-count">-</span>
          {xpathStatus}{" "}
        </div>
      </Space>
    </Content>
  );
};
