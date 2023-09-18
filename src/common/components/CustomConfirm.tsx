import { Button, Modal, ModalProps } from "antd";
import React, { ReactNode, useState } from "react";
import ReactDOM from "react-dom/client";

interface Props extends ModalProps {
  confirmTitle: string;
  confirmContent: ReactNode;
  isOkButtonEnabled: boolean;
  onAlt: () => void;
  altText: string;
  destroy?: () => void;
}

export const customConfirm = (props: Props) => {
  const container = ReactDOM.createRoot(document.createDocumentFragment());

  const destroy = () => container.unmount();

  container.render(<CustomConfirm {...props} {...{ destroy }} />);
};

export const CustomConfirm: React.FC<Props> = ({
  confirmTitle,
  confirmContent,
  onOk,
  isOkButtonEnabled,
  onCancel,
  onAlt,
  altText,
  destroy,
  ...rest
}) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleOk = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    //@ts-ignore
    onOk && onOk(e);
    setIsModalOpen(false);
    destroy && destroy();
  };

  const handleCancel = (e: React.MouseEvent<HTMLElement, MouseEvent>) => {
    //@ts-ignore
    onCancel && onCancel(e);
    setIsModalOpen(false);
    destroy && destroy();
  };

  const handleAlt = () => {
    onAlt();
    setIsModalOpen(false);
    destroy && destroy();
  };

  return (
    <Modal
      className="jdn__backConfirm_modal"
      open={isModalOpen}
      closable={false}
      footer={[
        <Button key="cancel" onClick={handleCancel}>
          Cancel
        </Button>,
        <Button key="alt" danger onClick={handleAlt}>
          {altText}
        </Button>,
        <Button key="ok" type="primary" disabled={!isOkButtonEnabled} onClick={handleOk}>
          Save
        </Button>,
      ]}
      {...{ rest }}
    >
      <div className="ant-modal-confirm-body">
        <span role="img" aria-label="exclamation-circle" className="anticon anticon-exclamation-circle">
          <svg
            viewBox="64 64 896 896"
            focusable="false"
            data-icon="exclamation-circle"
            width="1em"
            height="1em"
            fill="currentColor"
            aria-hidden="true"
          >
            {/* eslint-disable-next-line max-len */}
            <path
              d={`M512 64C264.6 64 64 264.6 64 512s200.6 448 448 448 448-200.6 448-448S759.4 64 512 64zm0 820c-205.4 0-372-166.6-372-372s166.6-372 372-372 372 166.6 372 372-166.6 372-372 372z`}
            ></path>
            {/* eslint-disable-next-line max-len */}
            <path
              d={`M464 688a48 48 0 1096 0 48 48 0 10-96 0zm24-112h48c4.4 0 8-3.6 8-8V296c0-4.4-3.6-8-8-8h-48c-4.4 0-8 3.6-8 8v272c0 4.4 3.6 8 8 8z`}
            ></path>
          </svg>
        </span>
        <span className="ant-modal-confirm-title">{confirmTitle}</span>
        <div className="ant-modal-confirm-content">{confirmContent}</div>
      </div>
    </Modal>
  );
};
