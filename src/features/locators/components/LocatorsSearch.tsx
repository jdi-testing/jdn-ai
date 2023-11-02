import React, { FC } from 'react';
import { Input } from 'antd';
import { MagnifyingGlass } from '@phosphor-icons/react';

interface Props {
  value: string;
  onChange: (e: string) => void;
}

export const LocatorsSearch: FC<Props> = ({ value, onChange }) => {
  return (
    <Input
      size="small"
      allowClear
      className="jdn__locatorsList_search"
      placeholder="Search by type, name or locator"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      suffix={<MagnifyingGlass size={14} />}
    />
  );
};
