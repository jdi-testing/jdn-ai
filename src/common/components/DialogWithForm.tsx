import React, { ReactNode, useEffect } from 'react';
import { Form, FormProps, Modal, ModalProps } from 'antd';
import { FormInstance } from 'antd/es/form/Form';
import { showOverlay, removeOverlay } from '../../pageServices/pageDataHandlers';
import { OnboardingStep } from '../../features/onboarding/constants';
import { useOnboardingContext } from '../../features/onboarding/OnboardingProvider';

interface JDNModalProps extends ModalProps {
  setIsModalOpen: (value: boolean) => void;
  open: boolean;
  onOk: () => void;
  cancelCallback?: () => void;
  enableOverlay?: boolean;
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
  const { open, setIsModalOpen, cancelCallback, enableOverlay = false, onOk, okButtonProps, ...restModal } = modalProps;

  const addRef = (arg: any) => console.log('DialogWithForm: ', `${arg}`); // поставить настоящую функцию

  useEffect(() => {
    if (enableOverlay) showOverlay();
    return () => removeOverlay();
  }, [open]);

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    cancelCallback && cancelCallback();
    console.log('Загадочная функция');

    setTimeout(() => {
      addRef(OnboardingStep.EditLocator);
    }, 100);
  };

  const onbrdPrevHandler = () => {
    setIsModalOpen(false);
    handleCancel();
  };

  const modalRef = React.createRef<HTMLElement>();
  const { updateStepRefs } = useOnboardingContext();
  useEffect(() => {
    updateStepRefs(OnboardingStep.EditLocator, modalRef, onbrdPrevHandler);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    e.stopPropagation();
    if (e.key === 'Enter' && !okButtonProps?.disabled) {
      onOk();
    }
  };

  return (
    <div onContextMenu={(e) => e.stopPropagation()} onKeyDown={handleKeyDown}>
      <Modal
        destroyOnClose
        style={{ top: '24px' }}
        onCancel={handleCancel}
        onOk={onOk}
        open={open}
        okButtonProps={okButtonProps}
        {...{ ...restModal }}
      >
        {open ? (
          <div className="jdn-test" ref={modalRef as React.LegacyRef<HTMLDivElement>}>
            <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} {...{ form }} {...{ ...restForm }}>
              {children}
            </Form>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
