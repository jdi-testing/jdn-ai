import { Row, Col, Typography, Select, Tooltip } from 'antd';
import { InternalSelectProps } from 'antd/es/select';
import { useSelector } from 'react-redux';
import { FrameworkType } from '../../../common/types/common';
import { selectCurrentPageObject } from '../selectors/pageObjects.selectors';
import React from 'react';

type Props = InternalSelectProps & {
  label: string;
};

const PageObjSettingsItem = ({ label, disabled, id, value, defaultValue, onChange, options }: Props) => {
  const currentPageObject = useSelector(selectCurrentPageObject);
  const isCurrentFrameworkVividus = currentPageObject?.framework === FrameworkType.Vividus;
  const selectContent = (
    <Select
      className="jdn__select"
      disabled={disabled}
      id={id}
      value={value}
      defaultValue={defaultValue}
      onChange={onChange}
      options={options}
    />
  );

  return (
    <Row>
      <Col flex="104px">
        <Typography.Text style={disabled ? { color: 'rgba(0, 0, 0, 0.25)' } : {}}>{label}</Typography.Text>
      </Col>
      <Col flex="auto">
        {isCurrentFrameworkVividus && id === 'annotationType' ? (
          <Tooltip placement="bottom" title="Not available for Vividus framework">
            {selectContent}
          </Tooltip>
        ) : (
          selectContent
        )}
      </Col>
    </Row>
  );
};

export default PageObjSettingsItem;
