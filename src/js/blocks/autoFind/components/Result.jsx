import { Content } from "antd/lib/layout/layout";
import Text from "antd/lib/typography/Text";
import React from "react";
import { autoFindStatus, useAutoFind } from "../autoFindProvider/AutoFindProvider";

const hideStatus = [autoFindStatus.loading, autoFindStatus.removed];

export const Result = () => {
  const [
    {
      status,
      unreachableNodes,
      unactualPrediction,
    },
  ] = useAutoFind();

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
    </Content>
  );
};
