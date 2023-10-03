import * as React from 'react';
import { Tag } from 'antd';

interface Props {
  hidden: boolean;
  primaryLabel: string;
  secondaryLabel: string;
  onDelete: React.MouseEventHandler<HTMLSpanElement>;
}

export const Chip: React.FC<Props> = ({ hidden, primaryLabel, secondaryLabel, onDelete }) => {
  return hidden ? (
    <></>
  ) : (
    <Tag closeIcon onClose={onDelete} className="tag--selected">
      {`${primaryLabel} ${secondaryLabel}`}
    </Tag>
  );
};
