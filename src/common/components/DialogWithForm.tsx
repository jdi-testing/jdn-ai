import { Form, FormProps, Modal, ModalProps } from "antd";
import { FormInstance } from "antd/es/form/Form";
import React, { ReactNode } from "react";

interface JDNModalProps extends ModalProps {
  setIsModalOpen: (value: boolean) => void;
  open: boolean,
  onOk: () => void,
  cancelCallback?: () => void,
}

interface JDNFormProps extends FormProps {
  form: FormInstance;
}

interface DialogFormProps {
  modalProps: JDNModalProps;
  children?: ReactNode;
  formProps: JDNFormProps;
}

export const DialogWithForm: React.FC<DialogFormProps> = ({ modalProps, formProps, children }) => {
  const { form, ...restForm } = formProps;
  const { open, setIsModalOpen, cancelCallback, ...restModal } = modalProps;

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    cancelCallback && cancelCallback();
  };

  return (
    <Modal
      destroyOnClose
      style={{ top: "24px" }}
      onCancel={handleCancel}
      open={open}
      {...{ ...restModal }}
    >
      {open ? (
        <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} {...{ form }} {...{ ...restForm }}>
          {children}
        </Form>
      ) : null}
    </Modal>
  );
};
