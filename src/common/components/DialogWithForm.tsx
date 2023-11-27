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

interface OnboardingRefProps {
  onNextClickHandler: () => void;
  isOkButtonDisabled: boolean;
}
interface DialogFormProps {
  modalProps: JDNModalProps;
  children?: ReactNode;
  formProps: JDNFormProps;
  onboardingRefProps?: OnboardingRefProps;
}

export const DialogWithForm: React.FC<DialogFormProps> = ({ modalProps, formProps, children, onboardingRefProps }) => {
  const { form, ...restForm } = formProps;
  const { open, setIsModalOpen, cancelCallback, enableOverlay = false, onOk, okButtonProps, ...restModal } = modalProps;
  const { onNextClickHandler, isOkButtonDisabled } = onboardingRefProps || {};

  useEffect(() => {
    if (enableOverlay) showOverlay();
    return () => removeOverlay();
  }, [open]);

  const handleCancel = () => {
    form.resetFields();
    setIsModalOpen(false);
    cancelCallback && cancelCallback();
  };

  const onbrdPrevHandler = () => {
    setIsModalOpen(false);
    handleCancel();
  };

  const modalRef = React.createRef<HTMLElement>();
  const { updateStepRefs, modifyStepRefByKey } = useOnboardingContext();
  useEffect(() => {
    if (!modalRef.current) return;
    updateStepRefs(OnboardingStep.EditLocator, modalRef, onNextClickHandler, onbrdPrevHandler);
  }, []);

  useEffect(() => {
    modifyStepRefByKey(OnboardingStep.EditLocator, modalRef, {
      onClick: onNextClickHandler,
      disabled: isOkButtonDisabled,
    });
  }, [isOkButtonDisabled]);

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
          <div className="jdn__dialog-with-form" ref={modalRef as React.LegacyRef<HTMLDivElement>}>
            <Form labelCol={{ span: 4 }} wrapperCol={{ span: 20 }} {...{ form }} {...{ ...restForm }}>
              {children}
            </Form>
          </div>
        ) : null}
      </Modal>
    </div>
  );
};
