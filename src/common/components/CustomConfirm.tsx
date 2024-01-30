/* eslint-disable @typescript-eslint/no-unused-vars */
import React, { ReactNode, useState } from 'react';
import ReactDOM from 'react-dom/client';
import { ExclamationCircleOutlined } from '@ant-design/icons';
import { Button, Modal } from 'antd';
import '../styles/customConfirm.less';
import { ModalProps } from 'antd/lib/modal/interface';

interface Props extends ModalProps {
  confirmTitle: string;
  confirmContent: ReactNode;
  isOkButtonEnabled: boolean;
  onAlt: () => void;
  altText: string;
  destroy?: () => void;
}

const CustomConfirm: React.FC<Props> = ({
  confirmTitle,
  confirmContent,
  isOkButtonEnabled,
  onCancel,
  onAlt,
  altText,
  destroy,
  ...rest
}) => {
  const [isModalOpen, setIsModalOpen] = useState(true);

  const handleClose = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    if (onCancel) onCancel(e);
    setIsModalOpen(false);
    if (destroy) destroy();
  };

  const handleAltAndClose = () => {
    onAlt();
    setIsModalOpen(false);
    if (destroy) destroy();
  };

  return (
    <Modal
      className="jdn__back-confirm_modal"
      open={isModalOpen}
      closable={false}
      footer={[
        <Button key="cancel" onClick={handleClose}>
          Cancel
        </Button>,
        <Button key="alt" danger onClick={handleAltAndClose}>
          {altText}
        </Button>,
        <Button key="ok" type="primary" disabled={!isOkButtonEnabled} onClick={handleClose}>
          Save
        </Button>,
      ]}
      {...rest}
    >
      <div className="ant-modal-confirm-body">
        <ExclamationCircleOutlined className="custom-confirm__icon" />
        <span className="ant-modal-confirm-title">{confirmTitle}</span>
        <div className="ant-modal-confirm-content">{confirmContent}</div>
      </div>
    </Modal>
  );
};

export const customConfirm = (props: Props) => {
  const container = ReactDOM.createRoot(document.createDocumentFragment());

  const destroy = () => container.unmount();

  container.render(<CustomConfirm {...props} destroy={destroy} />);
};

export default CustomConfirm;
