import React, { FC } from 'react';
import { Button } from 'antd';
import { ButtonProps } from 'antd/lib';

export const PageObjGenerationButton: FC<ButtonProps> = ({ children, ...rest }) => {
  return (
    <Button {...{ ...rest }} className="jdn__buttons jdn__generationButtons_generate" style={{ marginRight: '10px' }}>
      {children}
    </Button>
  );
};
