import { Button, Tooltip } from "antd";
import { Copy } from "phosphor-react";
import React, { useState } from "react";
import { copyTitle } from "../constants/constants";
import { copyToClipboard } from "../utils/helpers";

interface Props {
  copyText: string;
  buttonClassName: string;
}

export const CopyButton: React.FC<Props> = ({ copyText, buttonClassName }) => {
  const [copyTooltipTitle, setTooltipTitle] = useState(copyTitle.Copy);

  const handleCopy = () => {
    copyToClipboard(copyText);
    setTooltipTitle(copyTitle.Copied);
  };

  const handleMouseEnter = () => {
    if (copyTooltipTitle === copyTitle.Copied) setTooltipTitle(copyTitle.Copy);
  };

  return (
    <React.Fragment>
      <Tooltip placement="bottom" title={copyTooltipTitle}>
        <Button
          onClick={handleCopy}
          onMouseEnter={handleMouseEnter}
          className={buttonClassName}
          icon={<Copy size={14} />}
        />
      </Tooltip>
    </React.Fragment>
  );
};
