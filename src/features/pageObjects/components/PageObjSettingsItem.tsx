import { Row, Col, Typography, Select } from 'antd';
import { InternalSelectProps } from 'antd/es/select';
import React from 'react';

type Props = InternalSelectProps & {
  label: string;
};

const PageObjSettingsItem = ({ label, disabled, id, value, defaultValue, onChange, options }: Props) => {
  return (
    <Row>
      <Col flex="104px">
        <Typography.Text style={disabled ? { color: 'rgba(0, 0, 0, 0.25)' } : {}}>{label}</Typography.Text>
      </Col>
      <Col flex="auto">
        <Select
          className="jdn__select"
          disabled={disabled}
          id={id}
          value={value}
          defaultValue={defaultValue}
          onChange={onChange}
          options={options}
        />
      </Col>
    </Row>
  );
};

export default PageObjSettingsItem;
