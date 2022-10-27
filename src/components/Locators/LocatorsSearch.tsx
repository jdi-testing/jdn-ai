import { Input } from "antd";
import { MagnifyingGlass } from "phosphor-react";
import React from "react";

interface Props {
  value: string;
  onChange: (e: string) => void;
}

export const LocatorsSearch: React.FC<Props> = ({ value, onChange }) => {
  return (
    <Input
      className="jdn__locatorsList_search"
      placeholder="Search by type, name or xpath"
      value={value}
      onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
      suffix={<MagnifyingGlass size={14} />}
    />
  );
};
