import React, { ReactNode, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal, ModalProps } from 'antd';

import '../styles/customConfirm.less';

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
        <ExclamationCircleOutlined className="custom-confirm__icon" />
        <span className="ant-modal-confirm-title">{confirmTitle}</span>
        <div className="ant-modal-confirm-content">{confirmContent}</div>
      </div>
    </Modal>
  );
};
