import React, { useState } from 'react';
import { Button, Tooltip } from 'antd';
import { Copy } from '@phosphor-icons/react';
import { copyToClipboard } from '../utils/copyToClipboard';
import { CopyTitle } from '../types/common';

interface Props {
  copyText: string;
  buttonClassName: string;
}

export const CopyButton: React.FC<Props> = ({ copyText, buttonClassName }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(CopyTitle.Copy);

  const handleCopy = () => {
    copyToClipboard(copyText);
    setTooltipTitle(CopyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === CopyTitle.Copied) setTooltipTitle(CopyTitle.Copy);
  };

  return (
    <Tooltip placement="bottom" title={copyTooltipTitle}>
      <Button
        onClick={handleCopy}
        onMouseEnter={handleMouseEnter}
        className={buttonClassName}
        icon={<Copy size={14} />}
      />
    </Tooltip>
  );
};
