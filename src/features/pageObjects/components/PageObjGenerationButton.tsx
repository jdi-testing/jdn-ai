import React, { FC } from 'react';
import { Button, ButtonProps } from 'antd';

interface Props extends ButtonProps {
  refFn?: () => React.RefObject<HTMLDivElement> | null;
}
export const PageObjGenerationButton: FC<Props> = ({ children, refFn, ...rest }) => {
  const ref = refFn ? refFn() : null;
  return (
    <Button {...{ ...(ref ? { ref } : {}), ...rest }} className="jdn__buttons jdn__generationButtons_generate">
      {children}
    </Button>
  );
};
